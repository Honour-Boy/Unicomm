import ChatList from "./ChatList"
import Userinfo from "./UserInfo"

const List = () => {
  return (
    <div className='w-[450px] h-screen max-h-screen'>
      <Userinfo/>
      <ChatList/>
    </div>
  )
}

export default List