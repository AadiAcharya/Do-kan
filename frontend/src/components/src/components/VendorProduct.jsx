import axios from "axios";


const API = axios.create({

baseURL:"http://localhost:5000"

});


API.interceptors.response.use(

response=>response,


error=>{

if(error.response?.status===401){

alert("Session expired, please login again");

localStorage.removeItem("token");

window.location.href="/login";

}

return Promise.reject(error);

}

);


export default API;
