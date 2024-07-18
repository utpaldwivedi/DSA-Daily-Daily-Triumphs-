let username=null
let cf_username=null
let lc_username=null
let min_cf=null
let min_lc=null
let isLoggedIn=false
let currPage=0


const cf=document.querySelector(".codeforcesTab")
cf.addEventListener("click",fetchCodeforcesDetails)

const lc=document.querySelector(".leetcodeTab")
lc.addEventListener("click",fetchLeetcodeDetails)

function handlePage(){
    if(!isLoggedIn)return
    let login=document.querySelector(".login")
    login.style.display=currPage?"grid":"none";
    let content=document.querySelector(".content")
    content.style.display=currPage?"none":"block"
    let st=document.querySelector(".st")
    st.style.display=currPage?"none":"block"
    let st_high=document.querySelector(".st_high")
    st_high.style.display=currPage?"block":"none"
    currPage^=1;
}
const setting=document.querySelector(".setting")
setting.addEventListener("click",handlePage)

const submit=document.querySelector("#submit")
submit.addEventListener("click",async(event)=>{
    console.log("submit was called")
    event.preventDefault();
    username=document.querySelector("#username").value
    cf_username=document.querySelector("#cf_username").value
    lc_username=document.querySelector("#lc_username").value
    min_cf=document.querySelector("#min_cf").value
    min_lc=document.querySelector("#min_lc").value

    const check_cf=await fetchCodeforcesDetails(true)
    const check_lc=await fetchLeetcodeDetails(true)  
    if(check_cf && check_lc){
        const complete=document.querySelector(".complete");
        complete.style.display="flex";
        const incomplete=document.querySelector(".incomplete");
        incomplete.style.display="none";
    }else{
        const complete=document.querySelector(".complete");
        complete.style.display="none";
        const incomplete=document.querySelector(".incomplete");
        incomplete.style.display="flex";
    } 

    if(username)document.querySelector(".name").innerHTML = username;
    else document.querySelector(".name").innerHTML = "Coder"

    localStorage.setItem("username", username);
    localStorage.setItem("cf_username", cf_username);
    localStorage.setItem("lc_username", lc_username);
    localStorage.setItem("min_cf", min_cf);
    localStorage.setItem("min_lc", min_lc);
    

    if(!cf_username && !lc_username){
        isLoggedIn=false
        localStorage.setItem("isLoggedIn", isLoggedIn);
        alert("Please enter either Codeforces or Leetcode username to proceed")
    }
    else{
        isLoggedIn=true
        localStorage.setItem("isLoggedIn", isLoggedIn);
        
        handlePage()
        fetchCodeforcesDetails(false);
    } 
})

document.addEventListener("DOMContentLoaded", async() => {
    username = localStorage.getItem("username");
    cf_username = localStorage.getItem("cf_username");
    lc_username = localStorage.getItem("lc_username");
    min_cf = localStorage.getItem("min_cf");
    min_cf=Number(min_cf);
    min_lc = localStorage.getItem("min_lc");
    min_lc=Number(min_lc);
    isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    
    if (username) {
        document.querySelector("#username").value = username;
        document.querySelector(".name").innerHTML = username;
    }
    else{
        document.querySelector(".name").innerHTML = "Coder";
    }
    if (cf_username) {
        document.querySelector("#cf_username").value = cf_username;
    }
    if (lc_username) {
        document.querySelector("#lc_username").value = lc_username;
    }
    if(min_cf){
        document.querySelector("#min_cf").value = min_cf;
    }
    if(min_lc){
        document.querySelector("#min_lc").value = min_lc;
    }

    if (isLoggedIn) {
        currPage=0;
        handlePage();
        const check_cf=await fetchCodeforcesDetails(true)
        const check_lc=await fetchLeetcodeDetails(true) 
        if(check_cf && check_lc){
            const complete=document.querySelector(".complete");
            complete.style.display="flex";
            const incomplete=document.querySelector(".incomplete");
            incomplete.style.display="none";
        }else{
            const complete=document.querySelector(".complete");
            complete.style.display="none";
            const incomplete=document.querySelector(".incomplete");
            incomplete.style.display="flex";
        }
        fetchCodeforcesDetails(false);
    }
});


function checkTime(timestamp){
    const now=new Date();
    const currDate=now.getDate()
    const currMonth=now.getMonth()
    const currYear=now.getFullYear()

    const time=new Date(timestamp)
    const date=time.getDate()
    const month=time.getMonth()
    const year=time.getFullYear()
    
    if(date!=currDate||month!=currMonth||year!=currYear)return false
    else return true
}


async function fetchCodeforcesDetails(checking=false){
    if(checking!==true){
        cf.style.background="rgb(178, 225, 240)";
        lc.style.background="rgb(240,248,255)";

        const loadingTag=document.querySelector(".loading")
        loadingTag.style.display="flex"
        const dataTag=document.querySelector(".data")
        dataTag.style.display="none"
    }
    

    const url=`https://codeforces.com/api/user.status?handle=${cf_username}&count=100`
    try{
        if(!cf_username){
            console.log("Codeforces username not provided.");
            return true;
        }
        let response=await axios.get(url);
        response=response.data["result"];

        let cf_detailsSet=new Set();
        let tagsSet=new Set();

        response.forEach((resObj)=>{
            if(resObj["verdict"]!="OK"||!checkTime(resObj["creationTimeSeconds"]*1000))return;
            const required_details={
                contest_id:resObj["problem"]["contestId"],
                contest_problem:resObj["problem"]["index"],
                rating:resObj["problem"]["rating"]
            };
            cf_detailsSet.add(JSON.stringify(required_details));
            resObj["problem"]["tags"].forEach((tag)=>tagsSet.add(tag))
        });
        const formattedSet = [...cf_detailsSet].map(item => {
            if (typeof item === 'string') return JSON.parse(item);
            else if (typeof item === 'object') return item;
        });
        const cf_details=Array.from(formattedSet)
        const tagsArr=Array.from(tagsSet)
        let rating_num={}
        const noOfQuestions=cf_details.length;
        
        cf_details.forEach((detail)=>{
            if(detail["rating"] in rating_num){
                rating_num[detail["rating"]]++;
            }
            else{
                rating_num[detail["rating"]]=1;
            }
        });
        rating_num=Object.entries(rating_num)

        const ques=document.querySelector("#ques");
        if(min_cf!==null){
            if(noOfQuestions>=Number(min_cf))ques.style.color="rgb(27, 205, 27)";
            else ques.style.color="#dc3545";
        }
        if(checking===true){
            if(noOfQuestions>=Number(min_cf))return true;
            else return false;
        }
        ques.innerHTML=noOfQuestions;
        const rating=document.querySelector("#rating");
        rating.innerHTML=`<ul>${rating_num.map(r_n=>`<li><span style="font-size:25px">${r_n[0]} : </span> <span style="font-size:25px"> ${r_n[1]}</span></li>`).join('')}</ul>`;
        const tags=document.querySelector("#tags");
        tags.innerHTML=`<ul style="list-style-type:none; padding:0 ; margin-top:15px; max-width:100%;">${tagsArr.map(tag=>`<li style="display:inline-block; margin:0 5px">${tag}</li>`)}</ul>`;
        const loadingTag=document.querySelector(".loading");
        loadingTag.style.display="none";
        const dataTag=document.querySelector(".data")
        dataTag.style.display="block";
    }catch(err){
        console.log("Error in fetching 100 most recent submissions from Codeforces:",err)
    }
}

async function fetchLeetcodeDetails(checking=false){
    if(checking!==true){
        lc.style.background="rgb(178, 225, 240)";
        cf.style.background="rgb(240,248,255)";

        const loadingTag=document.querySelector(".loading")
        loadingTag.style.display="flex"
        const dataTag=document.querySelector(".data")
        dataTag.style.display="none"
    }

    try{
        if(!lc_username){
            console.log("Leetcode username is not provided.")
            return true;
        }
        const queryRecent20SubmissionsLeetcode = `
            query recent20Submissions($username: String!, $limit: Int!) {
                recentAcSubmissionList(username: $username, limit: $limit) {
                titleSlug
                timestamp      
                }
            }
        `
        const response=await axios.post('https://leetcode.com/graphql/', {
                                query: queryRecent20SubmissionsLeetcode,
                                variables: {
                                    username: lc_username,
                                    limit: 20,
                                },
                                operationName: "recent20Submissions"
                                })
        let time_slug=response.data["data"]["recentAcSubmissionList"]
        time_slug=time_slug.filter((t_s)=>{
            return checkTime(t_s["timestamp"]*1000)
        })

        let noOfQuestions=time_slug.length;
        let noOfEasy=0,noOfMedium=0,noOfHard=0
        let tagsSet=new Set()

        for(const t_s of time_slug){
            try{
                const queryDifficultyTagsLeetcode=`
                    query questionDifficultyTags($titleSlug: String!) {
                        question(titleSlug: $titleSlug) {
                            difficulty
                            topicTags {
                                name
                            }
                        }
                    }
                `
                const res=await axios.post('https://leetcode.com/graphql/', {
                                    query: queryDifficultyTagsLeetcode,
                                    variables: {
                                        titleSlug: t_s["titleSlug"]
                                    },
                                    operationName: "questionDifficultyTags"
                                })
                const diff_tags=res.data["data"]["question"]
                
                if(diff_tags['difficulty']==='Easy')noOfEasy++
                else if(diff_tags['difficulty']==='Medium')noOfMedium++
                else if(diff_tags['difficulty']==='Hard')noOfHard++

                diff_tags["topicTags"].forEach((tagObj)=>{
                    tagsSet.add(tagObj['name'])
                })
                
            }catch(err){
                console.log('Failed to fetch ques difficulty and tags on Leetcode:',err)
            }
        }
        const tagsArr=Array.from(tagsSet)
        const ques=document.querySelector("#ques");

        if(min_lc!==null){
            if(noOfQuestions>=Number(min_lc))ques.style.color="rgb(27, 205, 27)";
            else ques.style.color="#dc3545";
        }
        if(checking===true){
            if(noOfQuestions>=Number(min_lc))return true;
            else return false;
        }
        ques.innerHTML=noOfQuestions;        
        const rating=document.querySelector("#rating");
        rating.innerHTML=`<ul><li><span style="color: rgb(0 175 155);font-size:25px">Easy</span> : <span style="font-size:25px">${noOfEasy}</span></li><li><span style="color: rgb(255 184 0);font-size:25px;">Medium</span> : <span style="font-size:25px">${noOfMedium}</span></li><li><span style="color: rgb(255 45 85);font-size:25px;">Hard</span> : <span style="font-size:25px">${noOfHard}</span></li></ul>`;
        const tags=document.querySelector("#tags");
        tags.innerHTML=`<ul style="list-style-type:none; padding:0 ; margin-top:15px;">${tagsArr.map(tag=>`<li style="display:inline-block; margin:0 5px">${tag}</li>`)}</ul>`;
        const loadingTag=document.querySelector(".loading");
        loadingTag.style.display="none";
        const dataTag=document.querySelector(".data")
        dataTag.style.display="block";

    }catch(err){
        console.log('Failed to fetch 20 recent submissions from Leetcode:',err)
    }
}
