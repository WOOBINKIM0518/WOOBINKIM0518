const axios = require("axios");
const cheerio = require("cheerio");
// require("dotenv").config({path:"nodemailer/.env"});
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const email = {
    "host" : "smtp.mailtrap.io",
    "prot" : 2525,
    "secure" : false,
    "auth" : {
        "user" : "202ec03ca57c67",
        "pass" : "a98b96f973e6dd",
    }
}

const send = async(emailDate) =>{
    nodemailer.createTransport(email).sendMail(emailDate, function(error,info){
        if(error) {
            console.log(error);
        }else{
            console.log(info);
            return info.response;
        }
    });
};

const getHTML = async(keyword) =>{
    try{
        const html = (await axios.get(`https://www.jobkorea.co.kr/Search/?stext=${encodeURI(keyword)}`)).data;

        return html;
    } catch(e){
        console.log(e);
    }
};

const parsing = async(page) =>{
    const $ = cheerio.load(page);
    const jobs =[];
    const $jobList = $(".post");
    $jobList.each((idx,node)=>{
        const jobTitle = $(node).find(".title:eq(0)").text().trim();
        const company = $(node).find(".name:eq(0)").text().trim();
        const experience = $(node).find(".exp:eq(0)").text().trim();
        const education = $(node).find(".edu:eq(0)").text().trim();
        const reqularYN = $(node).find(".option > span:eq(2)").text().trim();
        const region = $(node).find(".long:eq(0)").text().trim();
        const dueDate = $(node).find(".date:eq(0)").text().trim();
        const etc = $(node).find(".etc:eq(0)").text().trim();

        if(experience.indexOf("신입") >-1
         || experience.indexOf("경력무관") >-1
        //  && education.indexOf("학력무관") >-1
        //  && education.indexOf("초대졸")>-1
        //  && education.indexOf("고졸")>-1
         ){
             jobs.push({
                 jobTitle, company, experience, education, reqularYN, region, dueDate, etc
             })
             
         }
         

        // console.log(jobTitle);
        // console.log(company);
        // console.log(experience);
        // console.log(education);
        // console.log(reqularYN);
    });
    return jobs
};

const getJob = async(keyword) => {
    const html = await getHTML(keyword);
    const jobs = await parsing(html);

    console.log(jobs);
    return jobs;
};

const crawlingJob = async(keyword) => {
    const jobs = await getJob("node.js");

    const h = [];
    h.push(`<table style="border:1px solid black; border-collspse:collapse;>"`);
    h.push(`<thead>`);
    h.push(`<tr>`);
    h.push(`<th style="border:1px solid black;">구인제목</th>`);
    h.push(`<th style="border:1px solid black;">회사명</th>`);
    h.push(`<th style="border:1px solid black;">경력여부</th>`);
    h.push(`<th style="border:1px solid black;">학력여부</th>`);
    h.push(`<th style="border:1px solid black;">정규직여부</th>`);
    h.push(`<th style="border:1px solid black;">지역</th>`);
    h.push(`<th style="border:1px solid black;">구인 마감일</th>`);
    h.push(`<th style="border:1px solid black;">비고</th>`);
    h.push(`</tr>`);
    h.push(`</head>`);
    h.push(`<tbody>`);
    jobs.forEach(job=>{
        h.push(`<tr>`);
        h.push(`<td style="border:1px solid black;">${job.jobTitle}</td>`)
        h.push(`<td style="border:1px solid black;">${job.company}</td>`)
        h.push(`<td style="border:1px solid black;">${job.experience}</td>`)
        h.push(`<td style="border:1px solid black;">${job.education}</td>`)
        h.push(`<td style="border:1px solid black;">${job.reqularYN}</td>`)
        h.push(`<td style="border:1px solid black;">${job.region}</td>`)
        h.push(`<td style="border:1px solid black;">${job.dueDate}</td>`)
        h.push(`<td style="border:1px solid black;">${job.etc}</td>`)
        h.push(`</tr>`);
    })
    h.push(`</tbody>`);
    h.push(`</table>`);

    const emailDate = {
        form :"dnqls518@gmail.com",
        to : "dnqls518@gmail.com",
        subject:"Node.js 구인 회사 정보",
        html : h.join("")
};

    await send(emailDate);

}

// cron.schedule("0 7 * * *",async ()=>{
//     crawlingJob("node.js");
// })
crawlingJob("node.js");
aaa