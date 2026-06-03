// Unit tests for the /api/signin controller.
//
// The real ../config/firebaseAdmins module loads a service-account JSON and calls
// admin.initializeApp() at require time, which can't run in CI. We mock it so these
// tests exercise the controller's own logic (header validation, token exchange,
// error handling) without any Firebase credentials or network.
const mockVerifyIdToken = jest.fn();
const mockCreateCustomToken = jest.fn();

jest.mock('../config/firebaseAdmins', () => ({
  auth: () => ({
    verifyIdToken: mockVerifyIdToken,
    createCustomToken: mockCreateCustomToken,
  }),
}));

const { signIn } = require('../controllers/authController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('signIn controller', () => {
  test('returns 401 when the Authorization header is missing', async () => {
    const req = { headers: {} };
    const res = makeRes();

    await signIn(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  test('returns 401 when the Authorization header is not a Bearer token', async () => {
    const req = { headers: { authorization: 'Basic abc123' } };
    const res = makeRes();

    await signIn(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  test('verifies the ID token and returns a fresh custom token', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'user-123' });
    mockCreateCustomToken.mockResolvedValue('custom-token-xyz');

    const req = { headers: { authorization: 'Bearer valid-id-token' } };
    const res = makeRes();

    await signIn(req, res);

    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-id-token');
    expect(mockCreateCustomToken).toHaveBeenCalledWith('user-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'custom-token-xyz' });
  });

  test('returns 401 when token verification fails', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('expired token'));

    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = makeRes();

    await signIn(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(mockCreateCustomToken).not.toHaveBeenCalled();
  });
});
