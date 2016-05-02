'use strict';
let http = require('http');
let data = "";
http.get({
    hostname: 'www.next.co.uk',
    path: '/clearance/?department=womenswear',
    port: 80
}, (res)=>{
    res.on('data', (chunk)=>{
        console.log(chunk);
        data += chunk;
    });
    res.on('end', ()=>{
        console.log(data.toString())
    });
});