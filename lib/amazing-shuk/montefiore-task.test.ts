import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,rm,readFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {randomUUID} from "node:crypto";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {MONTEFIORE_MISSION,MONTEFIORE_MISSION_ID as GATE,MONTEFIORE_TASK,GATEWAY_YEAR} from "./montefiore-task.ts";
import {applyGatewayAction,emptyGatewayProgress} from "./gateway-progress.ts";
import {GAN_HATUT_MISSION,buildMissionPresentation} from "./mission-arrival.ts";
import {WATER_TASK_ID as WELL} from "./water-measurement.ts";
import {findMission,SHUK_MISSIONS} from "./missions.ts";
import {parseAction} from "./parse-water-action.ts";
import {issueInvitation,redeemInvitation,sessionAction,sessionView} from "./participant-store.ts";
import type {GroupAction} from "./group-action.ts";
async function fixture(run:(path:string,tokens:Record<string,string>)=>Promise<void>){
 const dir=await mkdtemp(join(tmpdir(),"shuk-gateway-"));const path=join(dir,"state.json");
 try{const tokens:Record<string,string>={};for(const id of ["player-1","player-2","guide"])tokens[id]=await redeemInvitation(path,await issueInvitation(path,id));await run(path,tokens);}
 finally{await rm(dir,{recursive:true,force:true});}
}
test("destinations use distinct photographs and IDs, with no invented gateway map/GPS point or preview year",()=>{
 assert.equal(GAN_HATUT_MISSION.id,WELL);assert.notEqual(GATE,WELL);
 assert.equal(GAN_HATUT_MISSION.photo?.src,"/shuk/gan-hatut-cistern.jpg");assert.equal(GAN_HATUT_MISSION.cluePhoto,null);
 assert.equal(MONTEFIORE_MISSION.photo?.src,"/shuk/gan-hatut-gate.jpg");
 assert.equal(MONTEFIORE_MISSION.placement,null);assert.equal(MONTEFIORE_MISSION.arrival.destination,null);
 assert.equal(findMission(GATE),MONTEFIORE_MISSION);assert.equal(new Set(SHUK_MISSIONS.map(m=>m.id)).size,SHUK_MISSIONS.length);
 const view=buildMissionPresentation(MONTEFIORE_MISSION,{id:GATE,state:"available",arrivalPoints:0,arrivalMethod:null,gpsEnabled:false},4);
 assert.equal(view.marker.id,GATE);assert.equal(view.marker.offMap,true);
 assert.doesNotMatch(JSON.stringify([MONTEFIORE_MISSION.location,MONTEFIORE_TASK.story,MONTEFIORE_MISSION.photo]),/1883|5643/);
 assert.equal(GATEWAY_YEAR.hebrewYear,400+200+40+3+5000);
});
test("pure gateway stages reject bypasses and wrong languages/year; attempts are independent",()=>{
 let p=emptyGatewayProgress();
 assert.throws(()=>applyGatewayAction(p,{type:"set-gateway-year",answer:"1883"},"year"),/stage changed/);
 for(const id of ["hebrew","english","ladino"])p=applyGatewayAction(p,{type:"toggle-choice",optionId:id},"languages").progress;
 p=applyGatewayAction(p,{type:"submit"},"languages").progress;assert.equal(p.stage,"languages");assert.equal(p.attempts.languages,1);
 p=applyGatewayAction(p,{type:"toggle-choice",optionId:"ladino"},"languages").progress;
 p=applyGatewayAction(p,{type:"toggle-choice",optionId:"arabic"},"languages").progress;
 p=applyGatewayAction(p,{type:"submit"},"languages").progress;assert.equal(p.stage,"year");
 assert.throws(()=>applyGatewayAction(p,{type:"submit"},"languages"),/stage changed/);
 p=applyGatewayAction(p,{type:"set-gateway-year",answer:"1882"},"year").progress;
 p=applyGatewayAction(p,{type:"submit"},"year").progress;assert.equal(p.stage,"year");assert.equal(p.attempts.year,1);
 p=applyGatewayAction(p,{type:"set-gateway-year",answer:"1883"},"year").progress;
 p=applyGatewayAction(p,{type:"submit"},"year").progress;assert.equal(p.stage,"completed");assert.deepEqual(p.attempts,{languages:2,year:2});
});
test("gateway parser preserves stage, discards forged completion and rejects invalid year/stage/bonus",()=>{
 assert.deepEqual(parseAction({type:"set-gateway-year",missionId:GATE,stage:"year",answer:"1883",completed:true}),{type:"set-gateway-year",missionId:GATE,stage:"year",answer:"1883"});
 for(const body of [{type:"set-gateway-year",answer:"1883.0"},{type:"submit",stage:"completed"},{type:"submit",stage:"year",part:"bonus"}])assert.equal(parseAction({missionId:GATE,...body}),null);
});
test("gateway two-stage shared journey preserves all other missions/identities, persists attempts and awards once",()=>fixture(async(path,tokens)=>{
 const action=(who:string,body:GroupAction,id=randomUUID())=>sessionAction(path,tokens[who],body,id);
 await action("player-1",{type:"start",missionId:WELL});await action("player-1",{type:"move",missionId:WELL,move:"fill-large"});
 await action("guide",{type:"confirm-arrival",missionId:WELL});
 const before=JSON.parse(await readFile(path,"utf8"));const balance=(await sessionView(path,tokens.guide)).sharedBalance;
 await action("player-1",{type:"start",missionId:GATE});
 await assert.rejects(action("guide",{type:"guide-approve",missionId:GATE,stage:"year"}),/stage changed/);
 await assert.rejects(action("player-2",{type:"set-gateway-year",missionId:GATE,stage:"year",answer:"1883"}),/stage changed/);
 for(const optionId of ["hebrew","english","arabic"])await action("player-1",{type:"toggle-choice",missionId:GATE,stage:"languages",optionId});
 await assert.rejects(action("player-1",{type:"submit",missionId:GATE,stage:"languages"}),/answer-submitter/);
 await action("player-2",{type:"submit",missionId:GATE,stage:"languages"});
 const stageA=await sessionView(path,tokens["player-1"],Date.now(),GATE);
 assert.equal(stageA.session.completed,false);assert.equal(stageA.performance.reward,null);assert.deepEqual(stageA.sharedBalance,balance);
 assert.equal(stageA.session.kind,"gateway");
 await assert.rejects(action("player-2",{type:"toggle-choice",missionId:GATE,stage:"languages",optionId:"hebrew"}),/stage changed/);
 await action("player-2",{type:"set-gateway-year",missionId:GATE,stage:"year",answer:"1882"});await action("player-2",{type:"submit",missionId:GATE,stage:"year"});
 await action("player-1",{type:"hint",missionId:GATE,stage:"year",hint:1});
 await action("player-1",{type:"reset",missionId:GATE,stage:"year"});
 await action("player-2",{type:"set-gateway-year",missionId:GATE,stage:"year",answer:"1883"});
 const final={type:"submit",missionId:GATE,stage:"year"} as const;const ids=[randomUUID(),randomUUID()];
 const results=await Promise.allSettled(ids.map(id=>action("player-2",final,id)));
 for(const [i,result]of results.entries())if(result.status==="rejected"){assert.equal(result.reason.status,503);await action("player-2",final,ids[i]);}
 await action("player-2",final,ids[0]);
 const complete=await sessionView(path,tokens["player-1"],Date.now(),GATE);
 await assert.rejects(action("player-2",{type:"reset",missionId:GATE,stage:"year"}),/already complete/);
 assert.equal(complete.session.completed,true);assert.equal(complete.performance.reward?.foodTokens,2);assert.equal(complete.performance.hintsUsed,1);
 assert.equal(complete.sharedBalance.points,balance.points+(complete.performance.reward?.points??0));
 await action("guide",{type:"confirm-arrival",missionId:GATE});await action("guide",{type:"confirm-arrival",missionId:GATE});
 const after=JSON.parse(await readFile(path,"utf8"));
 for(const definition of SHUK_MISSIONS.filter(m=>m.id!==GATE))assert.deepEqual(after.missions[definition.id],before.missions[definition.id]);
 for(const key of ["sessions","invitations","roles","roleCandidates"])assert.deepEqual(after[key],before[key]);
 assert.deepEqual(after.missions[GATE].gateway.attempts,{languages:1,year:2});
 assert.equal(after.missions[GATE].arrival.points,20);assert.equal(after.missions[WELL].arrival.points,20);
 const reopened=await promisify(execFile)(process.execPath,["--experimental-strip-types","--disable-warning=ExperimentalWarning","--input-type=module","-e",'import {sessionView} from "./lib/amazing-shuk/participant-store.ts"; process.stdout.write(JSON.stringify(await sessionView(process.argv[1],process.argv[2],Date.now(),process.argv[3])));',path,tokens["player-2"],GATE]);
 const shared=await sessionView(path,tokens["player-1"],Date.now(),GATE);
 assert.deepEqual(JSON.parse(reopened.stdout).session.gateway,shared.session.kind==="gateway"?shared.session.gateway:null);
 assert.deepEqual(JSON.parse(reopened.stdout).sharedBalance,shared.sharedBalance);
}));
