import axios from 'axios';


const instance = axios.create({
    baseURL: "https://myburger-react-a5b01.firebaseio.com/"
})

export default instance;