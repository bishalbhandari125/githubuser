import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();

const GithubProvider = ({children}) => {
    const [githubUser , setGithubUser] = useState(mockUser);
    const [repos , setRepos] = useState(mockRepos);
    const [followers , setFollowers] = useState(mockFollowers);
    
    //request loading 
    const [requests,setRequests] = useState(0)
    const [isLoading ,setIsLoading] = useState(false);

    //Error Loading
    const [error,setError] = useState({show:false,msg:""})

    const searchGithubUser = async(user) => {
       toggleError()
       setIsLoading(true)
       const response = await axios(`${rootUrl}/users/${user}`)
       .catch(err => console.log(err))
        
       if(response){
        setGithubUser(response.data)
        const {login , followers_url} = response.data;
        //repos
        // axios(`${rootUrl}/users/${login}/repos?per_page=100`)
        // .then((response) =>
        // setRepos(response.data)
        // )
       
        // //followers
        // axios(`${followers_url}?per_page=100`)
        // .then((response) => 
        // setFollowers(response.data)
        // );
        await Promise.allSettled([
            axios(`${rootUrl}/users/${login}/repos?per_page=100`),
            axios(`${followers_url}?per_page=100`),
        ]).then((results) => {
            console.log(results);
            const [repos,followers] = results;
            const status = "fulfilled";
            if(repos.status === status) {
                setRepos(repos.value.data)    
            }
            if(followers.status === status) {
                setFollowers(followers.value.data)    
            }
          
        }); 
       }
       else{
        toggleError(true , "There is no user with that username")
       }
       checkRequests();
       setIsLoading(false);
    }
//check rate
const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
    .then(({data}) => {
       let {rate:{remaining}} = data;
       setRequests(remaining)
       if(remaining === 0) {
        //Throw a error
        toggleError(true ,"Sorry, You have exceeded your hourly rate limit !")
       }
    })
    .catch((err)=>console.log(err));
};
    function toggleError(show=false, msg=''){
        setError({show , msg})
    }
   

    //error message
    useEffect(
        checkRequests, [])

    return(
        <GithubContext.Provider value={{githubUser,repos,followers,requests, error, searchGithubUser, isLoading , }}>{children}</GithubContext.Provider>
    );
};

export { GithubProvider, GithubContext}
 
