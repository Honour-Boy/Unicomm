import { ClipLoader } from 'react-spinners';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <ClipLoader color="orange" size={50} />
    </div>
  );
};

export default LoadingSpinner;
