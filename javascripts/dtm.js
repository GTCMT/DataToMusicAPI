(function () {
var Module;if(!Module)Module=(typeof EM!=="undefined"?EM:null)||{};var moduleOverrides={};for(var key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;if(Module["ENVIRONMENT"]){if(Module["ENVIRONMENT"]==="WEB"){ENVIRONMENT_IS_WEB=true}else if(Module["ENVIRONMENT"]==="WORKER"){ENVIRONMENT_IS_WORKER=true}else if(Module["ENVIRONMENT"]==="NODE"){ENVIRONMENT_IS_NODE=true}else if(Module["ENVIRONMENT"]==="SHELL"){ENVIRONMENT_IS_SHELL=true}else{throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.")}}else{ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER}if(ENVIRONMENT_IS_NODE){if(!Module["print"])Module["print"]=console.log;if(!Module["printErr"])Module["printErr"]=console.warn;var nodeFS;var nodePath;Module["read"]=function read(filename,binary){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);var ret=nodeFS["readFileSync"](filename);return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};Module["load"]=function load(f){globalEval(read(f))};if(!Module["thisProgram"]){if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}else{Module["thisProgram"]="unknown-program"}}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(!Module["print"])Module["print"]=print;if(typeof printErr!="undefined")Module["printErr"]=printErr;if(typeof read!="undefined"){Module["read"]=read}else{Module["read"]=function read(){throw"no read() available (jsc?)"}}Module["readBinary"]=function readBinary(f){if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}var data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response)}else{onerror()}};xhr.onerror=onerror;xhr.send(null)};if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof console!=="undefined"){if(!Module["print"])Module["print"]=function print(x){console.log(x)};if(!Module["printErr"])Module["printErr"]=function printErr(x){console.warn(x)}}else{var TRY_USE_DUMP=false;if(!Module["print"])Module["print"]=TRY_USE_DUMP&&typeof dump!=="undefined"?(function(x){dump(x)}):(function(x){})}if(ENVIRONMENT_IS_WORKER){Module["load"]=importScripts}if(typeof Module["setWindowTitle"]==="undefined"){Module["setWindowTitle"]=(function(title){document.title=title})}}else{throw"Unknown runtime environment. Where are we?"}function globalEval(x){eval.call(null,x)}if(!Module["load"]&&Module["read"]){Module["load"]=function load(f){globalEval(Module["read"](f))}}if(!Module["print"]){Module["print"]=(function(){})}if(!Module["printErr"]){Module["printErr"]=Module["print"]}if(!Module["arguments"]){Module["arguments"]=[]}if(!Module["thisProgram"]){Module["thisProgram"]="./this.program"}Module.print=Module["print"];Module.printErr=Module["printErr"];Module["preRun"]=[];Module["postRun"]=[];for(var key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var Runtime={setTempRet0:(function(value){tempRet0=value}),getTempRet0:(function(){return tempRet0}),stackSave:(function(){return STACKTOP}),stackRestore:(function(stackTop){STACKTOP=stackTop}),getNativeTypeSize:(function(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return Runtime.QUANTUM_SIZE}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}),getNativeFieldSize:(function(type){return Math.max(Runtime.getNativeTypeSize(type),Runtime.QUANTUM_SIZE)}),STACK_ALIGN:16,prepVararg:(function(ptr,type){if(type==="double"||type==="i64"){if(ptr&7){assert((ptr&7)===4);ptr+=4}}else{assert((ptr&3)===0)}return ptr}),getAlignSize:(function(type,size,vararg){if(!vararg&&(type=="i64"||type=="double"))return 8;if(!type)return Math.min(size,8);return Math.min(size||(type?Runtime.getNativeFieldSize(type):0),Runtime.QUANTUM_SIZE)}),dynCall:(function(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}),functionPointers:[],addFunction:(function(func){for(var i=0;i<Runtime.functionPointers.length;i++){if(!Runtime.functionPointers[i]){Runtime.functionPointers[i]=func;return 2*(1+i)}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}),removeFunction:(function(index){Runtime.functionPointers[(index-2)/2]=null}),warnOnce:(function(text){if(!Runtime.warnOnce.shown)Runtime.warnOnce.shown={};if(!Runtime.warnOnce.shown[text]){Runtime.warnOnce.shown[text]=1;Module.printErr(text)}}),funcWrappers:{},getFuncWrapper:(function(func,sig){assert(sig);if(!Runtime.funcWrappers[sig]){Runtime.funcWrappers[sig]={}}var sigCache=Runtime.funcWrappers[sig];if(!sigCache[func]){if(sig.length===1){sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func)}}else if(sig.length===2){sigCache[func]=function dynCall_wrapper(arg){return Runtime.dynCall(sig,func,[arg])}}else{sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func,Array.prototype.slice.call(arguments))}}}return sigCache[func]}),getCompilerSetting:(function(name){throw"You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"}),stackAlloc:(function(size){var ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+15&-16;return ret}),staticAlloc:(function(size){var ret=STATICTOP;STATICTOP=STATICTOP+size|0;STATICTOP=STATICTOP+15&-16;return ret}),dynamicAlloc:(function(size){var ret=DYNAMICTOP;DYNAMICTOP=DYNAMICTOP+size|0;DYNAMICTOP=DYNAMICTOP+15&-16;if(DYNAMICTOP>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){DYNAMICTOP=ret;return 0}}return ret}),alignMemory:(function(size,quantum){var ret=size=Math.ceil(size/(quantum?quantum:16))*(quantum?quantum:16);return ret}),makeBigInt:(function(low,high,unsigned){var ret=unsigned?+(low>>>0)+ +(high>>>0)*+4294967296:+(low>>>0)+ +(high|0)*+4294967296;return ret}),GLOBAL_BASE:8,QUANTUM_SIZE:4,__dummy__:0};Module["Runtime"]=Runtime;var ABORT=false;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];if(!func){try{func=eval("_"+ident)}catch(e){}}assert(func,"Cannot call unknown function "+ident+" (perhaps LLVM optimizations or closure removed it?)");return func}var cwrap,ccall;((function(){var JSfuncs={"stackSave":(function(){Runtime.stackSave()}),"stackRestore":(function(){Runtime.stackRestore()}),"arrayToC":(function(arr){var ret=Runtime.stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=Runtime.stackAlloc((str.length<<2)+1);writeStringToMemory(str,ret)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};ccall=function ccallFunc(ident,returnType,argTypes,args,opts){var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=Runtime.stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0){if(opts&&opts.async){EmterpreterAsync.asyncFinalizers.push((function(){Runtime.stackRestore(stack)}));return}Runtime.stackRestore(stack)}return ret};var sourceRegex=/^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;function parseJSFunc(jsfunc){var parsed=jsfunc.toString().match(sourceRegex).slice(1);return{arguments:parsed[0],body:parsed[1],returnValue:parsed[2]}}var JSsource=null;function ensureJSsource(){if(!JSsource){JSsource={};for(var fun in JSfuncs){if(JSfuncs.hasOwnProperty(fun)){JSsource[fun]=parseJSFunc(JSfuncs[fun])}}}}cwrap=function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}var argNames=argTypes.map((function(x,i){return"$"+i}));var funcstr="(function("+argNames.join(",")+") {";var nargs=argTypes.length;if(!numericArgs){ensureJSsource();funcstr+="var stack = "+JSsource["stackSave"].body+";";for(var i=0;i<nargs;i++){var arg=argNames[i],type=argTypes[i];if(type==="number")continue;var convertCode=JSsource[type+"ToC"];funcstr+="var "+convertCode.arguments+" = "+arg+";";funcstr+=convertCode.body+";";funcstr+=arg+"=("+convertCode.returnValue+");"}}var cfuncname=parseJSFunc((function(){return cfunc})).returnValue;funcstr+="var ret = "+cfuncname+"("+argNames.join(",")+");";if(!numericRet){var strgfy=parseJSFunc((function(){return Pointer_stringify})).returnValue;funcstr+="ret = "+strgfy+"(ret);"}if(!numericArgs){ensureJSsource();funcstr+=JSsource["stackRestore"].body.replace("()","(stack)")+";"}funcstr+="return ret})";return eval(funcstr)}}))();Module["ccall"]=ccall;Module["cwrap"]=cwrap;function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}Module["setValue"]=setValue;function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for setValue: "+type)}return null}Module["getValue"]=getValue;var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;Module["ALLOC_STACK"]=ALLOC_STACK;Module["ALLOC_STATIC"]=ALLOC_STATIC;Module["ALLOC_DYNAMIC"]=ALLOC_DYNAMIC;Module["ALLOC_NONE"]=ALLOC_NONE;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[typeof _malloc==="function"?_malloc:Runtime.staticAlloc,Runtime.stackAlloc,Runtime.staticAlloc,Runtime.dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var ptr=ret,stop;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];if(typeof curr==="function"){curr=Runtime.getFunctionIndex(curr)}type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=Runtime.getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}Module["allocate"]=allocate;function getMemory(size){if(!staticSealed)return Runtime.staticAlloc(size);if(typeof _sbrk!=="undefined"&&!_sbrk.called||!runtimeInitialized)return Runtime.dynamicAlloc(size);return _malloc(size)}Module["getMemory"]=getMemory;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return Module["UTF8ToString"](ptr)}Module["Pointer_stringify"]=Pointer_stringify;function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}Module["AsciiToString"]=AsciiToString;function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}Module["stringToAscii"]=stringToAscii;function UTF8ArrayToString(u8Array,idx){var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}Module["UTF8ArrayToString"]=UTF8ArrayToString;function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}Module["UTF8ToString"]=UTF8ToString;function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}Module["stringToUTF8Array"]=stringToUTF8Array;function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}Module["stringToUTF8"]=stringToUTF8;function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}Module["lengthBytesUTF8"]=lengthBytesUTF8;function demangle(func){var hasLibcxxabi=!!Module["___cxa_demangle"];if(hasLibcxxabi){try{var buf=_malloc(func.length);writeStringToMemory(func.substr(1),buf);var status=_malloc(4);var ret=Module["___cxa_demangle"](buf,0,0,status);if(getValue(status,"i32")===0&&ret){return Pointer_stringify(ret)}}catch(e){}finally{if(buf)_free(buf);if(status)_free(status);if(ret)_free(ret)}return func}Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");return func}function demangleAll(text){return text.replace(/__Z[\w\d_]+/g,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){var js=jsStackTrace();if(Module["extraStackTrace"])js+="\n"+Module["extraStackTrace"]();return demangleAll(js)}Module["stackTrace"]=stackTrace;function alignMemoryPage(x){if(x%4096>0){x+=4096-x%4096}return x}var HEAP;var buffer;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE=0,STATICTOP=0,staticSealed=false;var STACK_BASE=0,STACKTOP=0,STACK_MAX=0;var DYNAMIC_BASE=0,DYNAMICTOP=0;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;var totalMemory=64*1024;while(totalMemory<TOTAL_MEMORY||totalMemory<2*TOTAL_STACK){if(totalMemory<16*1024*1024){totalMemory*=2}else{totalMemory+=16*1024*1024}}if(totalMemory!==TOTAL_MEMORY){TOTAL_MEMORY=totalMemory}if(Module["buffer"]){buffer=Module["buffer"]}else{buffer=new ArrayBuffer(TOTAL_MEMORY)}updateGlobalBufferViews();HEAP32[0]=255;if(HEAPU8[0]!==255||HEAPU8[3]!==0)throw"Typed arrays 2 must be run on a little-endian system";Module["HEAP"]=HEAP;Module["buffer"]=buffer;Module["HEAP8"]=HEAP8;Module["HEAP16"]=HEAP16;Module["HEAP32"]=HEAP32;Module["HEAPU8"]=HEAPU8;Module["HEAPU16"]=HEAPU16;Module["HEAPU32"]=HEAPU32;Module["HEAPF32"]=HEAPF32;Module["HEAPF64"]=HEAPF64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Runtime.dynCall("v",func)}else{Runtime.dynCall("vi",func,[callback.arg])}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}Module["addOnPreRun"]=addOnPreRun;function addOnInit(cb){__ATINIT__.unshift(cb)}Module["addOnInit"]=addOnInit;function addOnPreMain(cb){__ATMAIN__.unshift(cb)}Module["addOnPreMain"]=addOnPreMain;function addOnExit(cb){__ATEXIT__.unshift(cb)}Module["addOnExit"]=addOnExit;function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}Module["addOnPostRun"]=addOnPostRun;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}Module["intArrayFromString"]=intArrayFromString;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}Module["intArrayToString"]=intArrayToString;function writeStringToMemory(string,buffer,dontAddNull){var array=intArrayFromString(string,dontAddNull);var i=0;while(i<array.length){var chr=array[i];HEAP8[buffer+i>>0]=chr;i=i+1}}Module["writeStringToMemory"]=writeStringToMemory;function writeArrayToMemory(array,buffer){for(var i=0;i<array.length;i++){HEAP8[buffer++>>0]=array[i]}}Module["writeArrayToMemory"]=writeArrayToMemory;function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}Module["writeAsciiToMemory"]=writeAsciiToMemory;if(!Math["imul"]||Math["imul"](4294967295,5)!==-5)Math["imul"]=function imul(a,b){var ah=a>>>16;var al=a&65535;var bh=b>>>16;var bl=b&65535;return al*bl+(ah*bl+al*bh<<16)|0};Math.imul=Math["imul"];if(!Math["clz32"])Math["clz32"]=(function(x){x=x>>>0;for(var i=0;i<32;i++){if(x&1<<31-i)return i}return 32});Math.clz32=Math["clz32"];if(!Math["trunc"])Math["trunc"]=(function(x){return x<0?Math.ceil(x):Math.floor(x)});Math.trunc=Math["trunc"];var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_min=Math.min;var Math_clz32=Math.clz32;var Math_trunc=Math.trunc;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}Module["addRunDependency"]=addRunDependency;function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["removeRunDependency"]=removeRunDependency;Module["preloadedImages"]={};Module["preloadedAudios"]={};var ASM_CONSTS=[];STATIC_BASE=8;STATICTOP=STATIC_BASE+1712;__ATINIT__.push();allocate([5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,164,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE);var tempDoublePtr=STATICTOP;STATICTOP+=16;function _sbrk(bytes){var self=_sbrk;if(!self.called){DYNAMICTOP=alignMemoryPage(DYNAMICTOP);self.called=true;assert(Runtime.dynamicAlloc);self.alloc=Runtime.dynamicAlloc;Runtime.dynamicAlloc=(function(){abort("cannot dynamically allocate, sbrk now has control")})}var ret=DYNAMICTOP;if(bytes!=0){var success=self.alloc(bytes);if(!success)return-1>>>0}return ret}Module["_memset"]=_memset;function _pthread_cleanup_push(routine,arg){__ATEXIT__.push((function(){Runtime.dynCall("vi",routine,[arg])}));_pthread_cleanup_push.level=__ATEXIT__.length}function ___lock(){}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}Module["_memcpy"]=_memcpy;function _pthread_cleanup_pop(){assert(_pthread_cleanup_push.level==__ATEXIT__.length,"cannot pop if something else added meanwhile!");__ATEXIT__.pop();_pthread_cleanup_push.level=__ATEXIT__.length}function _abort(){Module["abort"]()}Module["_pthread_self"]=_pthread_self;var SYSCALLS={varargs:0,get:(function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret}),getStr:(function(){var ret=Pointer_stringify(SYSCALLS.get());return ret}),get64:(function(){var low=SYSCALLS.get(),high=SYSCALLS.get();if(low>=0)assert(high===0);else assert(high===-1);return low}),getZero:(function(){assert(SYSCALLS.get()===0)})};function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;assert(offset_high===0);FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.get(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();var ret=0;if(!___syscall146.buffer){___syscall146.buffers=[null,[],[]];___syscall146.printChar=(function(stream,curr){var buffer=___syscall146.buffers[stream];assert(buffer);if(curr===0||curr===10){(stream===1?Module["print"]:Module["printErr"])(UTF8ArrayToString(buffer,0));buffer.length=0}else{buffer.push(curr)}})}for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];for(var j=0;j<len;j++){___syscall146.printChar(stream,HEAPU8[ptr+j])}ret+=len}return ret}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall54(which,varargs){SYSCALLS.varargs=varargs;try{return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___unlock(){}function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}__ATEXIT__.push((function(){var fflush=Module["_fflush"];if(fflush)fflush(0);var printChar=___syscall146.printChar;if(!printChar)return;var buffers=___syscall146.buffers;if(buffers[1].length)printChar(1,10);if(buffers[2].length)printChar(2,10)}));STACK_BASE=STACKTOP=Runtime.alignMemory(STATICTOP);staticSealed=true;STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=DYNAMICTOP=Runtime.alignMemory(STACK_MAX);function invoke_ii(index,a1){try{return Module["dynCall_ii"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiii(index,a1,a2,a3){try{return Module["dynCall_iiii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vi(index,a1){try{Module["dynCall_vi"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"invoke_ii":invoke_ii,"invoke_iiii":invoke_iiii,"invoke_vi":invoke_vi,"_pthread_cleanup_pop":_pthread_cleanup_pop,"___lock":___lock,"_abort":_abort,"_pthread_cleanup_push":_pthread_cleanup_push,"___syscall6":___syscall6,"_sbrk":_sbrk,"___syscall140":___syscall140,"_emscripten_memcpy_big":_emscripten_memcpy_big,"___syscall54":___syscall54,"___unlock":___unlock,"___syscall146":___syscall146,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT};// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=0;var n=0;var o=0;var p=0;var q=global.NaN,r=global.Infinity;var s=0,t=0,u=0,v=0,w=0.0,x=0,y=0,z=0,A=0.0;var B=0;var C=global.Math.floor;var D=global.Math.abs;var E=global.Math.sqrt;var F=global.Math.pow;var G=global.Math.cos;var H=global.Math.sin;var I=global.Math.tan;var J=global.Math.acos;var K=global.Math.asin;var L=global.Math.atan;var M=global.Math.atan2;var N=global.Math.exp;var O=global.Math.log;var P=global.Math.ceil;var Q=global.Math.imul;var R=global.Math.min;var S=global.Math.clz32;var T=env.abort;var U=env.assert;var V=env.invoke_ii;var W=env.invoke_iiii;var X=env.invoke_vi;var Y=env._pthread_cleanup_pop;var Z=env.___lock;var _=env._abort;var $=env._pthread_cleanup_push;var aa=env.___syscall6;var ba=env._sbrk;var ca=env.___syscall140;var da=env._emscripten_memcpy_big;var ea=env.___syscall54;var fa=env.___unlock;var ga=env.___syscall146;var ha=0.0;
// EMSCRIPTEN_START_FUNCS
function la(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+15&-16;return b|0}function ma(){return i|0}function na(a){a=a|0;i=a}function oa(a,b){a=a|0;b=b|0;i=a;j=b}function pa(a,b){a=a|0;b=b|0;if(!m){m=a;n=b}}function qa(a){a=a|0;B=a}function ra(){return B|0}function sa(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;var e=0,f=0.0,h=0;if(d==c)if(!(c>0.0&c<=1.0))if(c>1.0){f=c+-1.0;d=1.0}else{f=c;d=1.0}else{f=0.0;d=1.0}else{f=c;d=d-c}if((b|0)>0)e=0;else return;do{h=a+(e<<2)|0;g[h>>2]=(+g[h>>2]-f)/d;e=e+1|0}while((e|0)!=(b|0));return}function ta(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0.0,n=0.0;l=i;h=xa(b,0,0,0)|0;j=xa(b,1,0,0)|0;d=i;i=i+((1*(b<<3)|0)+15&-16)|0;k=i;i=i+((1*(b<<3)|0)+15&-16)|0;e=(b|0)>0;if(e)f=0;else{za(h,d,k);Ma(h);Ma(j);i=l;return}do{c[d+(f<<3)>>2]=c[a+(f<<2)>>2];g[d+(f<<3)+4>>2]=0.0;f=f+1|0}while((f|0)!=(b|0));za(h,d,k);if(e)d=0;else{Ma(h);Ma(j);i=l;return}do{n=+g[k+(d<<3)>>2];m=+g[k+(d<<3)+4>>2];g[a+(d<<2)>>2]=+E(+(n*n+m*m));d=d+1|0}while((d|0)!=(b|0));Ma(h);Ma(j);i=l;return}function ua(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;p=i;m=xa(d,0,0,0)|0;n=xa(d,1,0,0)|0;f=i;i=i+((1*(d<<3)|0)+15&-16)|0;j=i;i=i+((1*(d<<3)|0)+15&-16)|0;k=i;i=i+((1*(d<<3)|0)+15&-16)|0;o=i;i=i+((1*(d<<3)|0)+15&-16)|0;l=(d|0)>0;if(l){h=0;do{c[f+(h<<3)>>2]=c[a+(h<<2)>>2];g[f+(h<<3)+4>>2]=0.0;h=h+1|0}while((h|0)!=(d|0));za(m,f,j);if(l){f=0;do{g[k+(f<<3)>>2]=+g[j+(f<<3)>>2]*+g[b+(f<<2)>>2];g[k+(f<<3)+4>>2]=0.0;f=f+1|0}while((f|0)!=(d|0));za(n,k,o);if(!l){Ma(m);Ma(n);i=p;return}e=+(d|0);f=0;do{g[a+(f<<2)>>2]=+g[o+(f<<3)>>2]/e;f=f+1|0}while((f|0)!=(d|0));Ma(m);Ma(n);i=p;return}}else za(m,f,j);za(n,k,o);Ma(m);Ma(n);i=p;return}function va(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0.0,h=0,j=0,k=0,l=0,m=0,n=0,o=0.0;n=i;k=(b|0)/2|0;m=xa(b,0,0,0)|0;h=i;i=i+((1*(b<<3)|0)+15&-16)|0;l=i;i=i+((1*(b<<3)|0)+15&-16)|0;if((b|0)>0){j=0;do{c[h+(j<<3)>>2]=c[a+(j<<2)>>2];g[h+(j<<3)+4>>2]=0.0;j=j+1|0}while((j|0)!=(b|0));za(m,h,l);if((b|0)>1){h=0;f=0.0;e=0.0;do{o=+g[l+(h<<3)>>2];o=o*o;f=f+o;e=e+ +(h|0)*o;h=h+1|0}while((h|0)<(k|0))}else{f=0.0;e=0.0}}else{za(m,h,l);f=0.0;e=0.0}Ma(m);i=n;return +(+(d|0)*(e/f)/+(b|0))}function wa(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0;s=i;p=b+-1|0;e=d+-1|0;q=Q(e,p)|0;r=i;i=i+((1*(q+1<<2)|0)+15&-16)|0;do if((b|0)>1){o=+(e|0);if((d|0)<=1){c[r>>2]=c[a+(p<<2)>>2];e=0;break}b=(Q(e,b+-2|0)|0)+d|0;k=+g[a>>2];f=0;n=0;while(1){n=n+1|0;l=k;k=+g[a+(n<<2)>>2];j=k-l;h=f;m=0;while(1){g[r+(h<<2)>>2]=l+ +(m|0)/o*j;m=m+1|0;if((m|0)==(e|0))break;else h=h+1|0}if((n|0)==(p|0))break;else f=e+f|0}b=b+-1|0;f=p;h=9}else{b=0;f=0;h=9}while(0);if((h|0)==9){c[r+(b<<2)>>2]=c[a+(f<<2)>>2];if((d|0)>1){b=0;do{c[a+(b<<2)>>2]=c[r+((Q(b,p)|0)<<2)>>2];b=b+1|0}while((b|0)!=(e|0))}else e=0}c[a+(e<<2)>>2]=c[r+(q<<2)>>2];i=s;return}function xa(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0;f=(a<<3)+264|0;if(!e)i=La(f)|0;else{if(!d)d=0;else d=(c[e>>2]|0)>>>0<f>>>0?0:d;c[e>>2]=f;i=d}if(!i)return i|0;c[i>>2]=a;e=i+4|0;c[e>>2]=b;h=+(a|0);a:do if((a|0)>0){f=b;d=0;while(1){j=+(d|0)*-6.283185307179586/h;j=(f|0)==0?j:-j;g[i+264+(d<<3)>>2]=+G(+j);g[i+264+(d<<3)+4>>2]=+H(+j);d=d+1|0;if((d|0)==(a|0))break a;f=c[e>>2]|0}}while(0);h=+C(+(+E(+h)));f=a;e=i+8|0;d=4;while(1){b:do if((f|0)%(d|0)|0)while(1){switch(d|0){case 4:{d=2;break}case 2:{d=3;break}default:d=d+2|0}d=+(d|0)>h?f:d;if(!((f|0)%(d|0)|0))break b}while(0);f=(f|0)/(d|0)|0;c[e>>2]=d;c[e+4>>2]=f;if((f|0)<=1)break;else e=e+8|0}return i|0}function ya(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0;w=c[f>>2]|0;m=f+8|0;x=c[f+4>>2]|0;r=a+((Q(x,w)|0)<<3)|0;if((x|0)==1){j=Q(e,d)|0;i=a;f=b;while(1){t=f;u=c[t+4>>2]|0;v=i;c[v>>2]=c[t>>2];c[v+4>>2]=u;i=i+8|0;if((i|0)==(r|0))break;else f=f+(j<<3)|0}}else{j=Q(w,d)|0;l=Q(e,d)|0;i=a;f=b;while(1){ya(i,f,j,e,m,h);i=i+(x<<3)|0;if((i|0)==(r|0))break;else f=f+(l<<3)|0}}switch(w|0){case 2:{j=a;l=x;i=a+(x<<3)|0;f=h+264|0;while(1){o=+g[i>>2];y=+g[f>>2];a=i+4|0;n=+g[a>>2];q=+g[f+4>>2];p=o*y-n*q;q=y*n+o*q;g[i>>2]=+g[j>>2]-p;x=j+4|0;g[a>>2]=+g[x>>2]-q;g[j>>2]=p+ +g[j>>2];g[x>>2]=q+ +g[x>>2];l=l+-1|0;if(!l)break;else{j=j+8|0;i=i+8|0;f=f+(d<<3)|0}}return}case 3:{e=x<<1;n=+g[h+264+((Q(x,d)|0)<<3)+4>>2];l=h+264|0;m=d<<1;f=a;i=x;j=l;while(1){h=f+(x<<3)|0;o=+g[h>>2];p=+g[j>>2];a=f+(x<<3)+4|0;B=+g[a>>2];z=+g[j+4>>2];A=o*p-B*z;z=p*B+o*z;v=f+(e<<3)|0;o=+g[v>>2];B=+g[l>>2];w=f+(e<<3)+4|0;p=+g[w>>2];q=+g[l+4>>2];y=o*B-p*q;q=B*p+o*q;o=A+y;p=z+q;g[h>>2]=+g[f>>2]-o*.5;u=f+4|0;g[a>>2]=+g[u>>2]-p*.5;y=n*(A-y);q=n*(z-q);g[f>>2]=o+ +g[f>>2];g[u>>2]=p+ +g[u>>2];g[v>>2]=q+ +g[h>>2];g[w>>2]=+g[a>>2]-y;g[h>>2]=+g[h>>2]-q;g[a>>2]=y+ +g[a>>2];i=i+-1|0;if(!i)break;else{f=f+8|0;j=j+(d<<3)|0;l=l+(m<<3)|0}}return}case 4:{e=x<<1;b=x*3|0;f=h+264|0;r=d<<1;s=d*3|0;if(!(c[h+4>>2]|0)){i=a;j=x;l=f;m=f;while(1){v=i+(x<<3)|0;n=+g[v>>2];o=+g[l>>2];w=i+(x<<3)+4|0;y=+g[w>>2];D=+g[l+4>>2];E=n*o-y*D;D=o*y+n*D;C=i+(e<<3)|0;n=+g[C>>2];y=+g[m>>2];t=i+(e<<3)+4|0;o=+g[t>>2];p=+g[m+4>>2];q=n*y-o*p;p=y*o+n*p;h=i+(b<<3)|0;n=+g[h>>2];o=+g[f>>2];a=i+(b<<3)+4|0;y=+g[a>>2];z=+g[f+4>>2];B=n*o-y*z;z=o*y+n*z;n=+g[i>>2];y=n-q;u=i+4|0;o=+g[u>>2];A=o-p;n=q+n;g[i>>2]=n;o=p+o;g[u>>2]=o;p=E+B;q=D+z;B=E-B;z=D-z;g[C>>2]=n-p;g[t>>2]=o-q;g[i>>2]=p+ +g[i>>2];g[u>>2]=q+ +g[u>>2];g[v>>2]=y+z;g[w>>2]=A-B;g[h>>2]=y-z;g[a>>2]=A+B;j=j+-1|0;if(!j)break;else{i=i+8|0;l=l+(d<<3)|0;m=m+(r<<3)|0;f=f+(s<<3)|0}}return}else{i=a;j=x;l=f;m=f;while(1){w=i+(x<<3)|0;p=+g[w>>2];q=+g[l>>2];h=i+(x<<3)+4|0;A=+g[h>>2];o=+g[l+4>>2];n=p*q-A*o;o=q*A+p*o;t=i+(e<<3)|0;p=+g[t>>2];A=+g[m>>2];u=i+(e<<3)+4|0;q=+g[u>>2];y=+g[m+4>>2];z=p*A-q*y;y=A*q+p*y;a=i+(b<<3)|0;p=+g[a>>2];q=+g[f>>2];C=i+(b<<3)+4|0;A=+g[C>>2];B=+g[f+4>>2];E=p*q-A*B;B=q*A+p*B;p=+g[i>>2];A=p-z;v=i+4|0;q=+g[v>>2];D=q-y;p=z+p;g[i>>2]=p;q=y+q;g[v>>2]=q;y=n+E;z=o+B;E=n-E;B=o-B;g[t>>2]=p-y;g[u>>2]=q-z;g[i>>2]=y+ +g[i>>2];g[v>>2]=z+ +g[v>>2];g[w>>2]=A-B;g[h>>2]=D+E;g[a>>2]=A+B;g[C>>2]=D-E;j=j+-1|0;if(!j)break;else{i=i+8|0;l=l+(d<<3)|0;m=m+(r<<3)|0;f=f+(s<<3)|0}}return}}case 5:{C=Q(x,d)|0;n=+g[h+264+(C<<3)>>2];o=+g[h+264+(C<<3)+4>>2];C=Q(x,d<<1)|0;p=+g[h+264+(C<<3)>>2];q=+g[h+264+(C<<3)+4>>2];if((x|0)<=0)return;j=d*3|0;l=a;m=a+(x<<3)|0;e=a+(x<<1<<3)|0;b=a+(x*3<<3)|0;f=a+(x<<2<<3)|0;i=0;while(1){H=+g[l>>2];u=l+4|0;F=+g[u>>2];A=+g[m>>2];t=Q(i,d)|0;D=+g[h+264+(t<<3)>>2];v=m+4|0;M=+g[v>>2];I=+g[h+264+(t<<3)+4>>2];G=A*D-M*I;I=D*M+A*I;A=+g[e>>2];t=Q(i<<1,d)|0;M=+g[h+264+(t<<3)>>2];a=e+4|0;D=+g[a>>2];L=+g[h+264+(t<<3)+4>>2];J=A*M-D*L;L=M*D+A*L;A=+g[b>>2];t=Q(j,i)|0;D=+g[h+264+(t<<3)>>2];C=b+4|0;M=+g[C>>2];y=+g[h+264+(t<<3)+4>>2];E=A*D-M*y;y=D*M+A*y;A=+g[f>>2];t=Q(i<<2,d)|0;M=+g[h+264+(t<<3)>>2];w=f+4|0;D=+g[w>>2];B=+g[h+264+(t<<3)+4>>2];z=A*M-D*B;B=M*D+A*B;A=G+z;D=I+B;z=G-z;B=I-B;I=J+E;G=L+y;E=J-E;y=L-y;g[l>>2]=H+(I+A);g[u>>2]=F+(G+D);L=p*I+(H+n*A);J=p*G+(F+n*D);M=q*y+o*B;K=-(o*z)-q*E;g[m>>2]=L-M;g[v>>2]=J-K;g[f>>2]=M+L;g[w>>2]=K+J;A=n*I+(H+p*A);D=n*G+(F+p*D);B=o*y-q*B;E=q*z-o*E;g[e>>2]=B+A;g[a>>2]=E+D;g[b>>2]=A-B;g[C>>2]=D-E;i=i+1|0;if((i|0)==(x|0))break;else{l=l+8|0;m=m+8|0;e=e+8|0;b=b+8|0;f=f+8|0}}return}default:{t=c[h>>2]|0;v=La(w<<3)|0;a:do if((x|0)>0?(w|0)>0:0){if((w|0)>1)u=0;else{m=0;while(1){f=m;i=0;while(1){h=a+(f<<3)|0;d=c[h+4>>2]|0;C=v+(i<<3)|0;c[C>>2]=c[h>>2];c[C+4>>2]=d;i=i+1|0;if((i|0)==(w|0))break;else f=f+x|0}i=v;f=c[i>>2]|0;i=c[i+4>>2]|0;j=m;l=0;while(1){C=a+(j<<3)|0;c[C>>2]=f;c[C+4>>2]=i;l=l+1|0;if((l|0)==(w|0))break;else j=j+x|0}m=m+1|0;if((m|0)==(x|0))break a}}do{f=u;i=0;while(1){r=a+(f<<3)|0;s=c[r+4>>2]|0;C=v+(i<<3)|0;c[C>>2]=c[r>>2];c[C+4>>2]=s;i=i+1|0;if((i|0)==(w|0))break;else f=f+x|0}i=v;f=c[i>>2]|0;i=c[i+4>>2]|0;n=(c[k>>2]=f,+g[k>>2]);e=u;r=0;while(1){j=a+(e<<3)|0;l=j;c[l>>2]=f;c[l+4>>2]=i;l=Q(e,d)|0;m=a+(e<<3)+4|0;o=n;p=+g[m>>2];b=1;s=0;do{C=s+l|0;s=C-((C|0)<(t|0)?0:t)|0;L=+g[v+(b<<3)>>2];J=+g[h+264+(s<<3)>>2];K=+g[v+(b<<3)+4>>2];M=+g[h+264+(s<<3)+4>>2];o=o+(L*J-K*M);g[j>>2]=o;p=p+(J*K+L*M);g[m>>2]=p;b=b+1|0}while((b|0)!=(w|0));r=r+1|0;if((r|0)==(w|0))break;else e=e+x|0}u=u+1|0}while((u|0)!=(x|0))}while(0);Ma(v);return}}}function za(a,b,d){a=a|0;b=b|0;d=d|0;if((b|0)==(d|0)){d=La(c[a>>2]<<3)|0;ya(d,b,1,1,a+8|0,a);Pa(b|0,d|0,c[a>>2]<<3|0)|0;Ma(d);return}else{ya(d,b,1,1,a+8|0,a);return}}function Aa(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=c[a+60>>2];a=Ba(aa(6,d|0)|0)|0;i=b;return a|0}function Ba(a){a=a|0;if(a>>>0>4294963200){c[(Ca()|0)>>2]=0-a;a=-1}return a|0}function Ca(){var a=0;if(!(c[31]|0))a=168;else a=c[(Qa()|0)+64>>2]|0;return a|0}function Da(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;q=i;i=i+48|0;n=q+16|0;m=q;e=q+32|0;o=a+28|0;f=c[o>>2]|0;c[e>>2]=f;p=a+20|0;f=(c[p>>2]|0)-f|0;c[e+4>>2]=f;c[e+8>>2]=b;c[e+12>>2]=d;k=a+60|0;l=a+44|0;b=2;f=f+d|0;while(1){if(!(c[31]|0)){c[n>>2]=c[k>>2];c[n+4>>2]=e;c[n+8>>2]=b;h=Ba(ga(146,n|0)|0)|0}else{$(1,a|0);c[m>>2]=c[k>>2];c[m+4>>2]=e;c[m+8>>2]=b;h=Ba(ga(146,m|0)|0)|0;Y(0)}if((f|0)==(h|0)){f=6;break}if((h|0)<0){f=8;break}f=f-h|0;g=c[e+4>>2]|0;if(h>>>0<=g>>>0)if((b|0)==2){c[o>>2]=(c[o>>2]|0)+h;j=g;b=2}else j=g;else{j=c[l>>2]|0;c[o>>2]=j;c[p>>2]=j;j=c[e+12>>2]|0;h=h-g|0;e=e+8|0;b=b+-1|0}c[e>>2]=(c[e>>2]|0)+h;c[e+4>>2]=j-h}if((f|0)==6){n=c[l>>2]|0;c[a+16>>2]=n+(c[a+48>>2]|0);a=n;c[o>>2]=a;c[p>>2]=a}else if((f|0)==8){c[a+16>>2]=0;c[o>>2]=0;c[p>>2]=0;c[a>>2]=c[a>>2]|32;if((b|0)==2)d=0;else d=d-(c[e+4>>2]|0)|0}i=q;return d|0}function Ea(a){a=a|0;if(!(c[a+68>>2]|0))Fa(a);return}function Fa(a){a=a|0;return}function Ga(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;f=i;i=i+32|0;g=f;e=f+20|0;c[g>>2]=c[a+60>>2];c[g+4>>2]=0;c[g+8>>2]=b;c[g+12>>2]=e;c[g+16>>2]=d;if((Ba(ca(140,g|0)|0)|0)<0){c[e>>2]=-1;a=-1}else a=c[e>>2]|0;i=f;return a|0}function Ha(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+80|0;f=g;c[b+36>>2]=3;if((c[b>>2]&64|0)==0?(c[f>>2]=c[b+60>>2],c[f+4>>2]=21505,c[f+8>>2]=g+12,ea(54,f|0)|0):0)a[b+75>>0]=-1;f=Da(b,d,e)|0;i=g;return f|0}function Ia(a){a=a|0;return 0}function Ja(a){a=a|0;var b=0,d=0;do if(a){if((c[a+76>>2]|0)<=-1){b=Ka(a)|0;break}d=(Ia(a)|0)==0;b=Ka(a)|0;if(!d)Fa(a)}else{if(!(c[30]|0))b=0;else b=Ja(c[30]|0)|0;Z(152);a=c[37]|0;if(a)do{if((c[a+76>>2]|0)>-1)d=Ia(a)|0;else d=0;if((c[a+20>>2]|0)>>>0>(c[a+28>>2]|0)>>>0)b=Ka(a)|0|b;if(d|0)Fa(a);a=c[a+56>>2]|0}while((a|0)!=0);fa(152)}while(0);return b|0}function Ka(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a+20|0;g=a+28|0;if((c[b>>2]|0)>>>0>(c[g>>2]|0)>>>0?(ja[c[a+36>>2]&3](a,0,0)|0,(c[b>>2]|0)==0):0)b=-1;else{h=a+4|0;d=c[h>>2]|0;e=a+8|0;f=c[e>>2]|0;if(d>>>0<f>>>0)ja[c[a+40>>2]&3](a,d-f|0,1)|0;c[a+16>>2]=0;c[g>>2]=0;c[b>>2]=0;c[e>>2]=0;c[h>>2]=0;b=0}return b|0}function La(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;O=i;i=i+16|0;p=O;do if(a>>>0<245){q=a>>>0<11?16:a+11&-8;a=q>>>3;k=c[43]|0;b=k>>>a;if(b&3|0){b=(b&1^1)+a|0;d=212+(b<<1<<2)|0;e=d+8|0;f=c[e>>2]|0;g=f+8|0;h=c[g>>2]|0;do if((d|0)!=(h|0)){if(h>>>0<(c[47]|0)>>>0)_();a=h+12|0;if((c[a>>2]|0)==(f|0)){c[a>>2]=d;c[e>>2]=h;break}else _()}else c[43]=k&~(1<<b);while(0);N=b<<3;c[f+4>>2]=N|3;N=f+N+4|0;c[N>>2]=c[N>>2]|1;N=g;i=O;return N|0}h=c[45]|0;if(q>>>0>h>>>0){if(b|0){d=2<<a;d=b<<a&(d|0-d);d=(d&0-d)+-1|0;j=d>>>12&16;d=d>>>j;f=d>>>5&8;d=d>>>f;g=d>>>2&4;d=d>>>g;e=d>>>1&2;d=d>>>e;b=d>>>1&1;b=(f|j|g|e|b)+(d>>>b)|0;d=212+(b<<1<<2)|0;e=d+8|0;g=c[e>>2]|0;j=g+8|0;f=c[j>>2]|0;do if((d|0)!=(f|0)){if(f>>>0<(c[47]|0)>>>0)_();a=f+12|0;if((c[a>>2]|0)==(g|0)){c[a>>2]=d;c[e>>2]=f;l=c[45]|0;break}else _()}else{c[43]=k&~(1<<b);l=h}while(0);h=(b<<3)-q|0;c[g+4>>2]=q|3;e=g+q|0;c[e+4>>2]=h|1;c[e+h>>2]=h;if(l|0){f=c[48]|0;b=l>>>3;d=212+(b<<1<<2)|0;a=c[43]|0;b=1<<b;if(a&b){a=d+8|0;b=c[a>>2]|0;if(b>>>0<(c[47]|0)>>>0)_();else{m=a;n=b}}else{c[43]=a|b;m=d+8|0;n=d}c[m>>2]=f;c[n+12>>2]=f;c[f+8>>2]=n;c[f+12>>2]=d}c[45]=h;c[48]=e;N=j;i=O;return N|0}a=c[44]|0;if(a){d=(a&0-a)+-1|0;M=d>>>12&16;d=d>>>M;L=d>>>5&8;d=d>>>L;N=d>>>2&4;d=d>>>N;b=d>>>1&2;d=d>>>b;e=d>>>1&1;e=c[476+((L|M|N|b|e)+(d>>>e)<<2)>>2]|0;d=(c[e+4>>2]&-8)-q|0;b=e;while(1){a=c[b+16>>2]|0;if(!a){a=c[b+20>>2]|0;if(!a){k=e;break}}b=(c[a+4>>2]&-8)-q|0;N=b>>>0<d>>>0;d=N?b:d;b=a;e=N?a:e}g=c[47]|0;if(k>>>0<g>>>0)_();j=k+q|0;if(k>>>0>=j>>>0)_();h=c[k+24>>2]|0;e=c[k+12>>2]|0;do if((e|0)==(k|0)){b=k+20|0;a=c[b>>2]|0;if(!a){b=k+16|0;a=c[b>>2]|0;if(!a){o=0;break}}while(1){e=a+20|0;f=c[e>>2]|0;if(f|0){a=f;b=e;continue}e=a+16|0;f=c[e>>2]|0;if(!f)break;else{a=f;b=e}}if(b>>>0<g>>>0)_();else{c[b>>2]=0;o=a;break}}else{f=c[k+8>>2]|0;if(f>>>0<g>>>0)_();a=f+12|0;if((c[a>>2]|0)!=(k|0))_();b=e+8|0;if((c[b>>2]|0)==(k|0)){c[a>>2]=e;c[b>>2]=f;o=e;break}else _()}while(0);do if(h|0){a=c[k+28>>2]|0;b=476+(a<<2)|0;if((k|0)==(c[b>>2]|0)){c[b>>2]=o;if(!o){c[44]=c[44]&~(1<<a);break}}else{if(h>>>0<(c[47]|0)>>>0)_();a=h+16|0;if((c[a>>2]|0)==(k|0))c[a>>2]=o;else c[h+20>>2]=o;if(!o)break}b=c[47]|0;if(o>>>0<b>>>0)_();c[o+24>>2]=h;a=c[k+16>>2]|0;do if(a|0)if(a>>>0<b>>>0)_();else{c[o+16>>2]=a;c[a+24>>2]=o;break}while(0);a=c[k+20>>2]|0;if(a|0)if(a>>>0<(c[47]|0)>>>0)_();else{c[o+20>>2]=a;c[a+24>>2]=o;break}}while(0);if(d>>>0<16){N=d+q|0;c[k+4>>2]=N|3;N=k+N+4|0;c[N>>2]=c[N>>2]|1}else{c[k+4>>2]=q|3;c[j+4>>2]=d|1;c[j+d>>2]=d;a=c[45]|0;if(a|0){f=c[48]|0;b=a>>>3;e=212+(b<<1<<2)|0;a=c[43]|0;b=1<<b;if(a&b){a=e+8|0;b=c[a>>2]|0;if(b>>>0<(c[47]|0)>>>0)_();else{r=a;s=b}}else{c[43]=a|b;r=e+8|0;s=e}c[r>>2]=f;c[s+12>>2]=f;c[f+8>>2]=s;c[f+12>>2]=e}c[45]=d;c[48]=j}N=k+8|0;i=O;return N|0}}}else if(a>>>0<=4294967231){a=a+11|0;q=a&-8;k=c[44]|0;if(k){d=0-q|0;a=a>>>8;if(a)if(q>>>0>16777215)j=31;else{s=(a+1048320|0)>>>16&8;G=a<<s;r=(G+520192|0)>>>16&4;G=G<<r;j=(G+245760|0)>>>16&2;j=14-(r|s|j)+(G<<j>>>15)|0;j=q>>>(j+7|0)&1|j<<1}else j=0;b=c[476+(j<<2)>>2]|0;a:do if(!b){a=0;b=0;G=86}else{f=d;a=0;g=q<<((j|0)==31?0:25-(j>>>1)|0);h=b;b=0;while(1){e=c[h+4>>2]&-8;d=e-q|0;if(d>>>0<f>>>0)if((e|0)==(q|0)){a=h;b=h;G=90;break a}else b=h;else d=f;e=c[h+20>>2]|0;h=c[h+16+(g>>>31<<2)>>2]|0;a=(e|0)==0|(e|0)==(h|0)?a:e;e=(h|0)==0;if(e){G=86;break}else{f=d;g=g<<(e&1^1)}}}while(0);if((G|0)==86){if((a|0)==0&(b|0)==0){a=2<<j;a=k&(a|0-a);if(!a)break;s=(a&0-a)+-1|0;n=s>>>12&16;s=s>>>n;m=s>>>5&8;s=s>>>m;o=s>>>2&4;s=s>>>o;r=s>>>1&2;s=s>>>r;a=s>>>1&1;a=c[476+((m|n|o|r|a)+(s>>>a)<<2)>>2]|0}if(!a){j=d;k=b}else G=90}if((G|0)==90)while(1){G=0;s=(c[a+4>>2]&-8)-q|0;e=s>>>0<d>>>0;d=e?s:d;b=e?a:b;e=c[a+16>>2]|0;if(e|0){a=e;G=90;continue}a=c[a+20>>2]|0;if(!a){j=d;k=b;break}else G=90}if((k|0)!=0?j>>>0<((c[45]|0)-q|0)>>>0:0){f=c[47]|0;if(k>>>0<f>>>0)_();h=k+q|0;if(k>>>0>=h>>>0)_();g=c[k+24>>2]|0;d=c[k+12>>2]|0;do if((d|0)==(k|0)){b=k+20|0;a=c[b>>2]|0;if(!a){b=k+16|0;a=c[b>>2]|0;if(!a){u=0;break}}while(1){d=a+20|0;e=c[d>>2]|0;if(e|0){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}if(b>>>0<f>>>0)_();else{c[b>>2]=0;u=a;break}}else{e=c[k+8>>2]|0;if(e>>>0<f>>>0)_();a=e+12|0;if((c[a>>2]|0)!=(k|0))_();b=d+8|0;if((c[b>>2]|0)==(k|0)){c[a>>2]=d;c[b>>2]=e;u=d;break}else _()}while(0);do if(g|0){a=c[k+28>>2]|0;b=476+(a<<2)|0;if((k|0)==(c[b>>2]|0)){c[b>>2]=u;if(!u){c[44]=c[44]&~(1<<a);break}}else{if(g>>>0<(c[47]|0)>>>0)_();a=g+16|0;if((c[a>>2]|0)==(k|0))c[a>>2]=u;else c[g+20>>2]=u;if(!u)break}b=c[47]|0;if(u>>>0<b>>>0)_();c[u+24>>2]=g;a=c[k+16>>2]|0;do if(a|0)if(a>>>0<b>>>0)_();else{c[u+16>>2]=a;c[a+24>>2]=u;break}while(0);a=c[k+20>>2]|0;if(a|0)if(a>>>0<(c[47]|0)>>>0)_();else{c[u+20>>2]=a;c[a+24>>2]=u;break}}while(0);do if(j>>>0>=16){c[k+4>>2]=q|3;c[h+4>>2]=j|1;c[h+j>>2]=j;a=j>>>3;if(j>>>0<256){d=212+(a<<1<<2)|0;b=c[43]|0;a=1<<a;if(b&a){a=d+8|0;b=c[a>>2]|0;if(b>>>0<(c[47]|0)>>>0)_();else{w=a;x=b}}else{c[43]=b|a;w=d+8|0;x=d}c[w>>2]=h;c[x+12>>2]=h;c[h+8>>2]=x;c[h+12>>2]=d;break}a=j>>>8;if(a)if(j>>>0>16777215)d=31;else{M=(a+1048320|0)>>>16&8;N=a<<M;L=(N+520192|0)>>>16&4;N=N<<L;d=(N+245760|0)>>>16&2;d=14-(L|M|d)+(N<<d>>>15)|0;d=j>>>(d+7|0)&1|d<<1}else d=0;e=476+(d<<2)|0;c[h+28>>2]=d;a=h+16|0;c[a+4>>2]=0;c[a>>2]=0;a=c[44]|0;b=1<<d;if(!(a&b)){c[44]=a|b;c[e>>2]=h;c[h+24>>2]=e;c[h+12>>2]=h;c[h+8>>2]=h;break}f=j<<((d|0)==31?0:25-(d>>>1)|0);a=c[e>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(j|0)){d=a;G=148;break}b=a+16+(f>>>31<<2)|0;d=c[b>>2]|0;if(!d){G=145;break}else{f=f<<1;a=d}}if((G|0)==145)if(b>>>0<(c[47]|0)>>>0)_();else{c[b>>2]=h;c[h+24>>2]=a;c[h+12>>2]=h;c[h+8>>2]=h;break}else if((G|0)==148){a=d+8|0;b=c[a>>2]|0;N=c[47]|0;if(b>>>0>=N>>>0&d>>>0>=N>>>0){c[b+12>>2]=h;c[a>>2]=h;c[h+8>>2]=b;c[h+12>>2]=d;c[h+24>>2]=0;break}else _()}}else{N=j+q|0;c[k+4>>2]=N|3;N=k+N+4|0;c[N>>2]=c[N>>2]|1}while(0);N=k+8|0;i=O;return N|0}}}else q=-1;while(0);d=c[45]|0;if(d>>>0>=q>>>0){a=d-q|0;b=c[48]|0;if(a>>>0>15){N=b+q|0;c[48]=N;c[45]=a;c[N+4>>2]=a|1;c[N+a>>2]=a;c[b+4>>2]=q|3}else{c[45]=0;c[48]=0;c[b+4>>2]=d|3;N=b+d+4|0;c[N>>2]=c[N>>2]|1}N=b+8|0;i=O;return N|0}a=c[46]|0;if(a>>>0>q>>>0){L=a-q|0;c[46]=L;N=c[49]|0;M=N+q|0;c[49]=M;c[M+4>>2]=L|1;c[N+4>>2]=q|3;N=N+8|0;i=O;return N|0}if(!(c[161]|0)){c[163]=4096;c[162]=4096;c[164]=-1;c[165]=-1;c[166]=0;c[154]=0;x=p&-16^1431655768;c[p>>2]=x;c[161]=x}h=q+48|0;g=c[163]|0;j=q+47|0;f=g+j|0;g=0-g|0;k=f&g;if(k>>>0<=q>>>0){N=0;i=O;return N|0}a=c[153]|0;if(a|0?(w=c[151]|0,x=w+k|0,x>>>0<=w>>>0|x>>>0>a>>>0):0){N=0;i=O;return N|0}b:do if(!(c[154]&4)){a=c[49]|0;c:do if(a){d=620;while(1){b=c[d>>2]|0;if(b>>>0<=a>>>0?(t=d+4|0,(b+(c[t>>2]|0)|0)>>>0>a>>>0):0){e=d;d=t;break}d=c[d+8>>2]|0;if(!d){G=171;break c}}a=f-(c[46]|0)&g;if(a>>>0<2147483647){b=ba(a|0)|0;if((b|0)==((c[e>>2]|0)+(c[d>>2]|0)|0)){if((b|0)!=(-1|0)){h=b;f=a;G=191;break b}}else G=181}}else G=171;while(0);do if((G|0)==171?(v=ba(0)|0,(v|0)!=(-1|0)):0){a=v;b=c[162]|0;d=b+-1|0;if(!(d&a))a=k;else a=k-a+(d+a&0-b)|0;b=c[151]|0;d=b+a|0;if(a>>>0>q>>>0&a>>>0<2147483647){x=c[153]|0;if(x|0?d>>>0<=b>>>0|d>>>0>x>>>0:0)break;b=ba(a|0)|0;if((b|0)==(v|0)){h=v;f=a;G=191;break b}else G=181}}while(0);d:do if((G|0)==181){d=0-a|0;do if(h>>>0>a>>>0&(a>>>0<2147483647&(b|0)!=(-1|0))?(y=c[163]|0,y=j-a+y&0-y,y>>>0<2147483647):0)if((ba(y|0)|0)==(-1|0)){ba(d|0)|0;break d}else{a=y+a|0;break}while(0);if((b|0)!=(-1|0)){h=b;f=a;G=191;break b}}while(0);c[154]=c[154]|4;G=188}else G=188;while(0);if((((G|0)==188?k>>>0<2147483647:0)?(z=ba(k|0)|0,A=ba(0)|0,z>>>0<A>>>0&((z|0)!=(-1|0)&(A|0)!=(-1|0))):0)?(B=A-z|0,B>>>0>(q+40|0)>>>0):0){h=z;f=B;G=191}if((G|0)==191){a=(c[151]|0)+f|0;c[151]=a;if(a>>>0>(c[152]|0)>>>0)c[152]=a;j=c[49]|0;do if(j){e=620;do{a=c[e>>2]|0;b=e+4|0;d=c[b>>2]|0;if((h|0)==(a+d|0)){C=a;D=b;E=d;F=e;G=201;break}e=c[e+8>>2]|0}while((e|0)!=0);if(((G|0)==201?(c[F+12>>2]&8|0)==0:0)?j>>>0<h>>>0&j>>>0>=C>>>0:0){c[D>>2]=E+f;N=j+8|0;N=(N&7|0)==0?0:0-N&7;M=j+N|0;N=f-N+(c[46]|0)|0;c[49]=M;c[46]=N;c[M+4>>2]=N|1;c[M+N+4>>2]=40;c[50]=c[165];break}a=c[47]|0;if(h>>>0<a>>>0){c[47]=h;k=h}else k=a;d=h+f|0;a=620;while(1){if((c[a>>2]|0)==(d|0)){b=a;G=209;break}a=c[a+8>>2]|0;if(!a){b=620;break}}if((G|0)==209)if(!(c[a+12>>2]&8)){c[b>>2]=h;m=a+4|0;c[m>>2]=(c[m>>2]|0)+f;m=h+8|0;m=h+((m&7|0)==0?0:0-m&7)|0;a=d+8|0;a=d+((a&7|0)==0?0:0-a&7)|0;l=m+q|0;g=a-m-q|0;c[m+4>>2]=q|3;do if((a|0)!=(j|0)){if((a|0)==(c[48]|0)){N=(c[45]|0)+g|0;c[45]=N;c[48]=l;c[l+4>>2]=N|1;c[l+N>>2]=N;break}b=c[a+4>>2]|0;if((b&3|0)==1){j=b&-8;f=b>>>3;e:do if(b>>>0>=256){h=c[a+24>>2]|0;e=c[a+12>>2]|0;do if((e|0)==(a|0)){d=a+16|0;e=d+4|0;b=c[e>>2]|0;if(!b){b=c[d>>2]|0;if(!b){L=0;break}}else d=e;while(1){e=b+20|0;f=c[e>>2]|0;if(f|0){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<k>>>0)_();else{c[d>>2]=0;L=b;break}}else{f=c[a+8>>2]|0;if(f>>>0<k>>>0)_();b=f+12|0;if((c[b>>2]|0)!=(a|0))_();d=e+8|0;if((c[d>>2]|0)==(a|0)){c[b>>2]=e;c[d>>2]=f;L=e;break}else _()}while(0);if(!h)break;b=c[a+28>>2]|0;d=476+(b<<2)|0;do if((a|0)!=(c[d>>2]|0)){if(h>>>0<(c[47]|0)>>>0)_();b=h+16|0;if((c[b>>2]|0)==(a|0))c[b>>2]=L;else c[h+20>>2]=L;if(!L)break e}else{c[d>>2]=L;if(L|0)break;c[44]=c[44]&~(1<<b);break e}while(0);e=c[47]|0;if(L>>>0<e>>>0)_();c[L+24>>2]=h;b=a+16|0;d=c[b>>2]|0;do if(d|0)if(d>>>0<e>>>0)_();else{c[L+16>>2]=d;c[d+24>>2]=L;break}while(0);b=c[b+4>>2]|0;if(!b)break;if(b>>>0<(c[47]|0)>>>0)_();else{c[L+20>>2]=b;c[b+24>>2]=L;break}}else{d=c[a+8>>2]|0;e=c[a+12>>2]|0;b=212+(f<<1<<2)|0;do if((d|0)!=(b|0)){if(d>>>0<k>>>0)_();if((c[d+12>>2]|0)==(a|0))break;_()}while(0);if((e|0)==(d|0)){c[43]=c[43]&~(1<<f);break}do if((e|0)==(b|0))I=e+8|0;else{if(e>>>0<k>>>0)_();b=e+8|0;if((c[b>>2]|0)==(a|0)){I=b;break}_()}while(0);c[d+12>>2]=e;c[I>>2]=d}while(0);a=a+j|0;g=j+g|0}a=a+4|0;c[a>>2]=c[a>>2]&-2;c[l+4>>2]=g|1;c[l+g>>2]=g;a=g>>>3;if(g>>>0<256){d=212+(a<<1<<2)|0;b=c[43]|0;a=1<<a;do if(!(b&a)){c[43]=b|a;M=d+8|0;N=d}else{a=d+8|0;b=c[a>>2]|0;if(b>>>0>=(c[47]|0)>>>0){M=a;N=b;break}_()}while(0);c[M>>2]=l;c[N+12>>2]=l;c[l+8>>2]=N;c[l+12>>2]=d;break}a=g>>>8;do if(!a)d=0;else{if(g>>>0>16777215){d=31;break}M=(a+1048320|0)>>>16&8;N=a<<M;L=(N+520192|0)>>>16&4;N=N<<L;d=(N+245760|0)>>>16&2;d=14-(L|M|d)+(N<<d>>>15)|0;d=g>>>(d+7|0)&1|d<<1}while(0);e=476+(d<<2)|0;c[l+28>>2]=d;a=l+16|0;c[a+4>>2]=0;c[a>>2]=0;a=c[44]|0;b=1<<d;if(!(a&b)){c[44]=a|b;c[e>>2]=l;c[l+24>>2]=e;c[l+12>>2]=l;c[l+8>>2]=l;break}f=g<<((d|0)==31?0:25-(d>>>1)|0);a=c[e>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(g|0)){d=a;G=279;break}b=a+16+(f>>>31<<2)|0;d=c[b>>2]|0;if(!d){G=276;break}else{f=f<<1;a=d}}if((G|0)==276)if(b>>>0<(c[47]|0)>>>0)_();else{c[b>>2]=l;c[l+24>>2]=a;c[l+12>>2]=l;c[l+8>>2]=l;break}else if((G|0)==279){a=d+8|0;b=c[a>>2]|0;N=c[47]|0;if(b>>>0>=N>>>0&d>>>0>=N>>>0){c[b+12>>2]=l;c[a>>2]=l;c[l+8>>2]=b;c[l+12>>2]=d;c[l+24>>2]=0;break}else _()}}else{N=(c[46]|0)+g|0;c[46]=N;c[49]=l;c[l+4>>2]=N|1}while(0);N=m+8|0;i=O;return N|0}else b=620;while(1){a=c[b>>2]|0;if(a>>>0<=j>>>0?(H=a+(c[b+4>>2]|0)|0,H>>>0>j>>>0):0){b=H;break}b=c[b+8>>2]|0}g=b+-47|0;d=g+8|0;d=g+((d&7|0)==0?0:0-d&7)|0;g=j+16|0;d=d>>>0<g>>>0?j:d;a=d+8|0;e=h+8|0;e=(e&7|0)==0?0:0-e&7;N=h+e|0;e=f+-40-e|0;c[49]=N;c[46]=e;c[N+4>>2]=e|1;c[N+e+4>>2]=40;c[50]=c[165];e=d+4|0;c[e>>2]=27;c[a>>2]=c[155];c[a+4>>2]=c[156];c[a+8>>2]=c[157];c[a+12>>2]=c[158];c[155]=h;c[156]=f;c[158]=0;c[157]=a;a=d+24|0;do{a=a+4|0;c[a>>2]=7}while((a+4|0)>>>0<b>>>0);if((d|0)!=(j|0)){h=d-j|0;c[e>>2]=c[e>>2]&-2;c[j+4>>2]=h|1;c[d>>2]=h;a=h>>>3;if(h>>>0<256){d=212+(a<<1<<2)|0;b=c[43]|0;a=1<<a;if(b&a){a=d+8|0;b=c[a>>2]|0;if(b>>>0<(c[47]|0)>>>0)_();else{J=a;K=b}}else{c[43]=b|a;J=d+8|0;K=d}c[J>>2]=j;c[K+12>>2]=j;c[j+8>>2]=K;c[j+12>>2]=d;break}a=h>>>8;if(a)if(h>>>0>16777215)d=31;else{M=(a+1048320|0)>>>16&8;N=a<<M;L=(N+520192|0)>>>16&4;N=N<<L;d=(N+245760|0)>>>16&2;d=14-(L|M|d)+(N<<d>>>15)|0;d=h>>>(d+7|0)&1|d<<1}else d=0;f=476+(d<<2)|0;c[j+28>>2]=d;c[j+20>>2]=0;c[g>>2]=0;a=c[44]|0;b=1<<d;if(!(a&b)){c[44]=a|b;c[f>>2]=j;c[j+24>>2]=f;c[j+12>>2]=j;c[j+8>>2]=j;break}e=h<<((d|0)==31?0:25-(d>>>1)|0);a=c[f>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(h|0)){d=a;G=305;break}b=a+16+(e>>>31<<2)|0;d=c[b>>2]|0;if(!d){G=302;break}else{e=e<<1;a=d}}if((G|0)==302)if(b>>>0<(c[47]|0)>>>0)_();else{c[b>>2]=j;c[j+24>>2]=a;c[j+12>>2]=j;c[j+8>>2]=j;break}else if((G|0)==305){a=d+8|0;b=c[a>>2]|0;N=c[47]|0;if(b>>>0>=N>>>0&d>>>0>=N>>>0){c[b+12>>2]=j;c[a>>2]=j;c[j+8>>2]=b;c[j+12>>2]=d;c[j+24>>2]=0;break}else _()}}}else{N=c[47]|0;if((N|0)==0|h>>>0<N>>>0)c[47]=h;c[155]=h;c[156]=f;c[158]=0;c[52]=c[161];c[51]=-1;a=0;do{N=212+(a<<1<<2)|0;c[N+12>>2]=N;c[N+8>>2]=N;a=a+1|0}while((a|0)!=32);N=h+8|0;N=(N&7|0)==0?0:0-N&7;M=h+N|0;N=f+-40-N|0;c[49]=M;c[46]=N;c[M+4>>2]=N|1;c[M+N+4>>2]=40;c[50]=c[165]}while(0);a=c[46]|0;if(a>>>0>q>>>0){L=a-q|0;c[46]=L;N=c[49]|0;M=N+q|0;c[49]=M;c[M+4>>2]=L|1;c[N+4>>2]=q|3;N=N+8|0;i=O;return N|0}}c[(Ca()|0)>>2]=12;N=0;i=O;return N|0}function Ma(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(!a)return;d=a+-8|0;h=c[47]|0;if(d>>>0<h>>>0)_();a=c[a+-4>>2]|0;b=a&3;if((b|0)==1)_();e=a&-8;m=d+e|0;do if(!(a&1)){a=c[d>>2]|0;if(!b)return;k=d+(0-a)|0;j=a+e|0;if(k>>>0<h>>>0)_();if((k|0)==(c[48]|0)){a=m+4|0;b=c[a>>2]|0;if((b&3|0)!=3){q=k;g=j;break}c[45]=j;c[a>>2]=b&-2;c[k+4>>2]=j|1;c[k+j>>2]=j;return}e=a>>>3;if(a>>>0<256){b=c[k+8>>2]|0;d=c[k+12>>2]|0;a=212+(e<<1<<2)|0;if((b|0)!=(a|0)){if(b>>>0<h>>>0)_();if((c[b+12>>2]|0)!=(k|0))_()}if((d|0)==(b|0)){c[43]=c[43]&~(1<<e);q=k;g=j;break}if((d|0)!=(a|0)){if(d>>>0<h>>>0)_();a=d+8|0;if((c[a>>2]|0)==(k|0))f=a;else _()}else f=d+8|0;c[b+12>>2]=d;c[f>>2]=b;q=k;g=j;break}f=c[k+24>>2]|0;d=c[k+12>>2]|0;do if((d|0)==(k|0)){b=k+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){i=0;break}}else b=d;while(1){d=a+20|0;e=c[d>>2]|0;if(e|0){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}if(b>>>0<h>>>0)_();else{c[b>>2]=0;i=a;break}}else{e=c[k+8>>2]|0;if(e>>>0<h>>>0)_();a=e+12|0;if((c[a>>2]|0)!=(k|0))_();b=d+8|0;if((c[b>>2]|0)==(k|0)){c[a>>2]=d;c[b>>2]=e;i=d;break}else _()}while(0);if(f){a=c[k+28>>2]|0;b=476+(a<<2)|0;if((k|0)==(c[b>>2]|0)){c[b>>2]=i;if(!i){c[44]=c[44]&~(1<<a);q=k;g=j;break}}else{if(f>>>0<(c[47]|0)>>>0)_();a=f+16|0;if((c[a>>2]|0)==(k|0))c[a>>2]=i;else c[f+20>>2]=i;if(!i){q=k;g=j;break}}d=c[47]|0;if(i>>>0<d>>>0)_();c[i+24>>2]=f;a=k+16|0;b=c[a>>2]|0;do if(b|0)if(b>>>0<d>>>0)_();else{c[i+16>>2]=b;c[b+24>>2]=i;break}while(0);a=c[a+4>>2]|0;if(a)if(a>>>0<(c[47]|0)>>>0)_();else{c[i+20>>2]=a;c[a+24>>2]=i;q=k;g=j;break}else{q=k;g=j}}else{q=k;g=j}}else{q=d;g=e}while(0);if(q>>>0>=m>>>0)_();a=m+4|0;b=c[a>>2]|0;if(!(b&1))_();if(!(b&2)){if((m|0)==(c[49]|0)){p=(c[46]|0)+g|0;c[46]=p;c[49]=q;c[q+4>>2]=p|1;if((q|0)!=(c[48]|0))return;c[48]=0;c[45]=0;return}if((m|0)==(c[48]|0)){p=(c[45]|0)+g|0;c[45]=p;c[48]=q;c[q+4>>2]=p|1;c[q+p>>2]=p;return}g=(b&-8)+g|0;e=b>>>3;do if(b>>>0>=256){f=c[m+24>>2]|0;a=c[m+12>>2]|0;do if((a|0)==(m|0)){b=m+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){n=0;break}}else b=d;while(1){d=a+20|0;e=c[d>>2]|0;if(e|0){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}if(b>>>0<(c[47]|0)>>>0)_();else{c[b>>2]=0;n=a;break}}else{b=c[m+8>>2]|0;if(b>>>0<(c[47]|0)>>>0)_();d=b+12|0;if((c[d>>2]|0)!=(m|0))_();e=a+8|0;if((c[e>>2]|0)==(m|0)){c[d>>2]=a;c[e>>2]=b;n=a;break}else _()}while(0);if(f|0){a=c[m+28>>2]|0;b=476+(a<<2)|0;if((m|0)==(c[b>>2]|0)){c[b>>2]=n;if(!n){c[44]=c[44]&~(1<<a);break}}else{if(f>>>0<(c[47]|0)>>>0)_();a=f+16|0;if((c[a>>2]|0)==(m|0))c[a>>2]=n;else c[f+20>>2]=n;if(!n)break}d=c[47]|0;if(n>>>0<d>>>0)_();c[n+24>>2]=f;a=m+16|0;b=c[a>>2]|0;do if(b|0)if(b>>>0<d>>>0)_();else{c[n+16>>2]=b;c[b+24>>2]=n;break}while(0);a=c[a+4>>2]|0;if(a|0)if(a>>>0<(c[47]|0)>>>0)_();else{c[n+20>>2]=a;c[a+24>>2]=n;break}}}else{b=c[m+8>>2]|0;d=c[m+12>>2]|0;a=212+(e<<1<<2)|0;if((b|0)!=(a|0)){if(b>>>0<(c[47]|0)>>>0)_();if((c[b+12>>2]|0)!=(m|0))_()}if((d|0)==(b|0)){c[43]=c[43]&~(1<<e);break}if((d|0)!=(a|0)){if(d>>>0<(c[47]|0)>>>0)_();a=d+8|0;if((c[a>>2]|0)==(m|0))l=a;else _()}else l=d+8|0;c[b+12>>2]=d;c[l>>2]=b}while(0);c[q+4>>2]=g|1;c[q+g>>2]=g;if((q|0)==(c[48]|0)){c[45]=g;return}}else{c[a>>2]=b&-2;c[q+4>>2]=g|1;c[q+g>>2]=g}a=g>>>3;if(g>>>0<256){d=212+(a<<1<<2)|0;b=c[43]|0;a=1<<a;if(b&a){a=d+8|0;b=c[a>>2]|0;if(b>>>0<(c[47]|0)>>>0)_();else{o=a;p=b}}else{c[43]=b|a;o=d+8|0;p=d}c[o>>2]=q;c[p+12>>2]=q;c[q+8>>2]=p;c[q+12>>2]=d;return}a=g>>>8;if(a)if(g>>>0>16777215)d=31;else{o=(a+1048320|0)>>>16&8;p=a<<o;n=(p+520192|0)>>>16&4;p=p<<n;d=(p+245760|0)>>>16&2;d=14-(n|o|d)+(p<<d>>>15)|0;d=g>>>(d+7|0)&1|d<<1}else d=0;e=476+(d<<2)|0;c[q+28>>2]=d;c[q+20>>2]=0;c[q+16>>2]=0;a=c[44]|0;b=1<<d;do if(a&b){f=g<<((d|0)==31?0:25-(d>>>1)|0);a=c[e>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(g|0)){d=a;e=130;break}b=a+16+(f>>>31<<2)|0;d=c[b>>2]|0;if(!d){e=127;break}else{f=f<<1;a=d}}if((e|0)==127)if(b>>>0<(c[47]|0)>>>0)_();else{c[b>>2]=q;c[q+24>>2]=a;c[q+12>>2]=q;c[q+8>>2]=q;break}else if((e|0)==130){a=d+8|0;b=c[a>>2]|0;p=c[47]|0;if(b>>>0>=p>>>0&d>>>0>=p>>>0){c[b+12>>2]=q;c[a>>2]=q;c[q+8>>2]=b;c[q+12>>2]=d;c[q+24>>2]=0;break}else _()}}else{c[44]=a|b;c[e>>2]=q;c[q+24>>2]=e;c[q+12>>2]=q;c[q+8>>2]=q}while(0);q=(c[51]|0)+-1|0;c[51]=q;if(!q)a=628;else return;while(1){a=c[a>>2]|0;if(!a)break;else a=a+8|0}c[51]=-1;return}function Na(){}function Oa(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;h=b&3;i=d|d<<8|d<<16|d<<24;g=f&~3;if(h){h=b+4-h|0;while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=i;b=b+4|0}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0}return b-e|0}function Pa(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return da(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if(!e)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Qa(){return 0}function Ra(a,b){a=a|0;b=b|0;return ia[a&1](b|0)|0}function Sa(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ja[a&3](b|0,c|0,d|0)|0}function Ta(a,b){a=a|0;b=b|0;ka[a&1](b|0)}function Ua(a){a=a|0;T(0);return 0}function Va(a,b,c){a=a|0;b=b|0;c=c|0;T(1);return 0}function Wa(a){a=a|0;T(2)}

// EMSCRIPTEN_END_FUNCS
var ia=[Ua,Aa];var ja=[Va,Ha,Ga,Da];var ka=[Wa,Ea];return{_spectralCentroid:va,_fflush:Ja,_fftFilter:ua,_pthread_self:Qa,_memset:Oa,_linearInterp:wa,_malloc:La,_memcpy:Pa,_fft:ta,_normalize:sa,_free:Ma,___errno_location:Ca,runPostSets:Na,stackAlloc:la,stackSave:ma,stackRestore:na,establishStackSpace:oa,setThrew:pa,setTempRet0:qa,getTempRet0:ra,dynCall_ii:Ra,dynCall_iiii:Sa,dynCall_vi:Ta}})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var _spectralCentroid=Module["_spectralCentroid"]=asm["_spectralCentroid"];var _fflush=Module["_fflush"]=asm["_fflush"];var _fftFilter=Module["_fftFilter"]=asm["_fftFilter"];var _pthread_self=Module["_pthread_self"]=asm["_pthread_self"];var _memset=Module["_memset"]=asm["_memset"];var _linearInterp=Module["_linearInterp"]=asm["_linearInterp"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _fft=Module["_fft"]=asm["_fft"];var _normalize=Module["_normalize"]=asm["_normalize"];var _free=Module["_free"]=asm["_free"];var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];Runtime.stackAlloc=asm["stackAlloc"];Runtime.stackSave=asm["stackSave"];Runtime.stackRestore=asm["stackRestore"];Runtime.establishStackSpace=asm["establishStackSpace"];Runtime.setTempRet0=asm["setTempRet0"];Runtime.getTempRet0=asm["getTempRet0"];function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=Module.callMain=function callMain(args){args=args||[];ensureInitRuntime();var argc=args.length+1;function pad(){for(var i=0;i<4-1;i++){argv.push(0)}}var argv=[allocate(intArrayFromString(Module["thisProgram"]),"i8",ALLOC_NORMAL)];pad();for(var i=0;i<argc-1;i=i+1){argv.push(allocate(intArrayFromString(args[i]),"i8",ALLOC_NORMAL));pad()}argv.push(0);argv=allocate(argv,"i32",ALLOC_NORMAL);try{var ret=Module["_main"](argc,argv,0);exit(ret,true)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=Module.run=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["exit"](status)}else if(ENVIRONMENT_IS_SHELL&&typeof quit==="function"){quit(status)}throw new ExitStatus(status)}Module["exit"]=Module.exit=exit;var abortDecorators=[];function abort(what){if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output="abort("+what+") at "+stackTrace()+extra;if(abortDecorators){abortDecorators.forEach((function(decorator){output=decorator(output,what)}))}throw output}Module["abort"]=Module.abort=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}run()





var alias = {
    // modules
    array: ['array', 'arr', 'a'],
    clock: ['clock', 'clk', 'cl', 'c'],
    generator: ['generator', 'generate', 'gen', 'g'],
    instrument: ['instrument', 'instr', 'inst', 'i'],
    master: ['master', 'mstr', 'mst'],
    model: ['model', 'mdl', 'm'],
    synth: ['synth', 'syn', 's'],
    utils: ['utilities', 'utils', 'util', 'utl', 'u'],
};
/**
 * @fileOverview
 * @module core
 */

// TODO: put this in the master
var params = {
    isLogging: false
};

/**
 * Returns the singleton dtm object.
 * @name module:core#dtm
 * @type {object}
 */
var dtm = {
    version: '0.0.5',

    log: function (arg) {
        if (params.isLogging) {
            if (arguments.callee.caller.name) {
                console.log(arguments.callee.caller.name + ': ' + arg);
            } else {
                console.log(arg);
            }
        }
    },

    // TODO: put these in dtm.master
    modelColl: [],
    modelCallers: {},
    clocks: [],

    params: {
        plotter: null,
        printer: null,
        stream: false,
        traced: []
    },

    // TODO: a function to list currently loaded objects, such as data, arrays, models... - for console livecoding situation

    get: function (param) {
        switch (param) {
            case 'models':
                return dtm.modelColl;
            case 'modelNames':
                var res = [];
                dtm.modelColl.forEach(function (m) {
                    res.push(m.get('name'));
                });
                return res;
            default:
                return null;
        }
    },

    wa: {
        isOn: true,
        useOfflineContext: false
    },

    startWebAudio: function () {
        dtm.wa.isOn = true;

        dtm.wa.actx = new (window.AudioContext || window.webkitAudioContext)();
        dtm.wa.now = function () {
            return dtm.wa.actx.currentTime;
        };
        dtm.wa.out = function () {
            return dtm.wa.actx.destination;
        };
        dtm.wa.clMult = 0.01;
        dtm.wa.clockBuf = dtm.wa.actx.createBuffer(1, Math.round(dtm.wa.actx.sampleRate * dtm.wa.clMult), dtm.wa.actx.sampleRate);
    },

    startWebMidi: function () {
        if (isEmpty(MIDI.prototype.out)) {
            if (navigator.requestMIDIAccess) {
                navigator.requestMIDIAccess({
                    sysex: false
                }).then(function (webMidi) {
                    var devices = [];
                    var iter = webMidi.outputs.values();
                    for (var i = iter.next(); i && !i.done; i = iter.next()) {
                        devices.push(i.value);
                    }
                    MIDI.prototype.devices = devices;
                    MIDI.prototype.out = devices[0];
                }, null);
            } else {
                console.log("No MIDI support in your browser.");
            }
        }
    },

    oscParams: {
        isOpen: false,
        port: null
    },

    startOsc: function () {
        dtm.osc.isOn = true;
        dtm.osc.start();
    },

    export: function () {
        objForEach(dtm, function (v, k) {
            if (isEmpty(window[k])) {
                window[k] = v;
            }
        });
    },

    setPlotter: function (fn) {
        dtm.params.plotter = fn;
    },

    setPrinter: function (fn) {
        dtm.params.printer = fn;
    }
};

this.dtm = dtm;

dtm.loadData = function (url, cb) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        var ext = url.split('.').pop();

        switch (ext) {
            case 'txt':
            case 'csv':
//            req.responseType = 'blob';
                break;
            case 'json':
                xhr.responseType = 'json';
                break;
            case 'wav':
            case 'aif':
            case 'aiff':
            case 'ogg':
            case 'mp3':
                xhr.responseType = 'arraybuffer';
                break;
            default:
                xhr.responseType = 'blob';
                break;
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                if (typeof(cb) !== 'undefined') {
                    cb(xhr.response);
                }

                resolve(xhr.response);
            } else {
                reject(xhr.status);
            }
        };

        xhr.send();
    });
};

dtm.loadAudio = function (url, cb) {
    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4 && xhr.status == 200) {
                //var buf = xhr.response;
                //console.log(String.fromCharCode.apply(null, new Float32Array(buf)));

                actx.decodeAudioData(xhr.response, function (buf) {
                    resolve(buf);

                    if (typeof(cb) !== 'undefined') {
                        cb(buf);
                    }
                });
            }
        };

        xhr.send();
    });
};
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Float32Array.prototype.forEach) {
    Float32Array.prototype.forEach = function(callback, thisArg) {

        var T, k;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[k];

                // ii. Call the Call internal method of callback with T as the this value and
                // argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.17
// Reference: http://es5.github.io/#x15.4.4.17
if (!Float32Array.prototype.some) {
    Float32Array.prototype.some = function(fun/*, thisArg*/) {
        'use strict';

        if (this == null) {
            throw new TypeError('Array.prototype.some called on null or undefined');
        }

        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Float32Array.prototype.map) {

    Float32Array.prototype.map = function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this|
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len)
        //    where Array is the standard built-in constructor with that name and
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                //    method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal
                //     method of callback with T as the this value and argument
                //     list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor
                // { Value: mappedValue,
                //   Writable: true,
                //   Enumerable: true,
                //   Configurable: true },
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, k, {
                //   value: mappedValue,
                //   writable: true,
                //   enumerable: true,
                //   configurable: true
                // });

                // For best browser support, use the following:
                A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}

if (!Float32Array.prototype.every) {
    Float32Array.prototype.every = function(callbackfn, thisArg) {
        'use strict';
        var T, k;

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the this
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method
        //    of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
        if (typeof callbackfn !== 'function') {
            throw new TypeError();
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let k be 0.
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method
                //    of O with argument Pk.
                kValue = O[k];

                // ii. Let testResult be the result of calling the Call internal method
                //     of callbackfn with T as the this value and argument list
                //     containing kValue, k, and O.
                var testResult = callbackfn.call(T, kValue, k, O);

                // iii. If ToBoolean(testResult) is false, return false.
                if (!testResult) {
                    return false;
                }
            }
            k++;
        }
        return true;
    };
}
/**
 * @module utils
 */

/* TYPE CHECKING */
function isNaNfast(value) {
    return value !== value;
}

/**
 * Returns true for undefined, null, and NaN values
 * @param value
 * @returns {boolean}
 */
function isEmpty(value) {
    if (typeof(value) === 'undefined') {
        return true;
    } else if (value === null) {
        return true;
    } else return (typeof(value) === 'number' && isNaNfast(value));
}

/**
 * Returns true if the value is a number and is not NaN
 * @param value
 * @returns {boolean}
 */
function isNumber(value) {
    return (typeof(value) === 'number' && !isNaNfast(value));
}

/**
 * Checks if the value is a number and is an integer value
 * @param value
 * @returns {boolean}
 */
function isInteger(value) {
    if (isNumber(value)) {
        return Number.isInteger(value);
    } else {
        return false;
    }
}

/**
 * Checks if the value is a string
 * @param value
 * @returns {boolean}
 */
function isString(value) {
    return typeof(value) === 'string';
}

function toString(value) {
    if (isNumber(value)) {
        return value.toString();
    } else {
        return value;
    }
}

/**
 * Checks if the value is a boolean value
 * @param value
 * @returns {boolean}
 */
function isBoolean(value) {
    return typeof(value) === 'boolean';
}

/**
 * Checks if the value is a function
 * @param value
 * @returns {boolean}
 */
function isFunction(value) {
    return typeof(value) === 'function' && !value.hasOwnProperty('meta');
}

/**
 * Checks if the value is an instance of Promise
 * @param obj
 * @returns {boolean}
 */
function isPromise(obj) {
    if (isObject(obj)) {
        if (obj.constructor === Promise) {
            return true;
        }
    } else {
        return false;
    }
}

/**
 * Checks if the value is an object and not null object
 * @param val
 * @returns {boolean}
 */
function isObject(val) {
    return (typeof(val) === 'object' && val !== null);
}

/**
 * Checks if the value is primitive single value
 * @param val
 * @returns {boolean}
 */
function isSingleVal(val) {
    return (!isArray(val) && !isDtmObj(val) && !isFunction(val) && !isEmpty(val));
}

/**
 * Checks if a value is any kind of array
 * @private
 * @param val
 * @returns {boolean}
 */
function isArray(val) {
    return Array.isArray(val) || isFloat32Array(val);
    // return !isEmpty(val) && val.constructor === Array || isFloat32Array(val);
}

/**
 * Checks if the value is a Float32Array
 * @param val
 * @returns {boolean}
 */
function isFloat32Array(val) {
    var res = false;
    if (!isEmpty(val)) {
        // if (val.constructor.name === 'Float32Array' && val.length > 0) {
        if (val.constructor === Float32Array && val.length > 0) {
            res = true;
        }
    }
    return res;
}

/**
 * Checks if the value is a regular number array
 * @param val
 * @returns {boolean}
 */
function isNumArray(val) {
    var res = false;
    if (isArray(val) && !isFloat32Array(val) && val.length > 0) {
        res = val.every(function (v) {
            return isNumber(v);
        });
    }
    return res;
}

/**
 * Checks if the object is a string array with values like ['1', '2', '3.45']
 * @param val
 * @returns {boolean}
 */
function isParsableNumArray(val) {
    var res = false;
    if (isStringArray(val)) {
        res = val.every(function (val) {
            return !isNaNfast(parseFloat(val));
        })
    }
    return res;
}

/**
 * Checks if the array consists of the generic object type (i.e., {}) items
 * @param val
 * @returns {boolean}
 */
function isObjArray(val) {
    var res = false;
    if (isArray(val) && val.length > 0) {
        res = val.every(function (v) {
            return isObject(v) && !isDtmObj(v);
        });
    }
    return res;
}

/**
 * Checks if the value is either a regular or typed number array
 * @param val
 * @returns {boolean}
 */
function isNumOrFloat32Array(val) {
    return isFloat32Array(val) || isNumArray(val);
}

/**
 * Checks if the value is an array with mixed value types (e.g., numbers and strings mixed)
 * @param val
 * @returns {boolean}
 */
function isMixedArray(val) {
    return isArray(val) && !isStringArray(val) && !isBoolArray(val) && !isNumOrFloat32Array(val) && !isNestedArray(val) && !isNestedWithDtmArray(val);
}

/**
 * Checks if the value is a multi-dimensional array
 * @param val
 * @returns {boolean}
 */
function isNestedArray(val) {
    var res = false;
    if (isArray(val)) {
        // res = val.some(function (v) {
        //     return isArray(v);
        // });
        for (var i = 0, l = val.length; i < l; i++) {
            if (isArray(val[i])) {
                return true;
            }
        }
    }
    return res;
}

/**
 * Checks if the value is a nested (regular) array consist of the dtm.array instances
 * @param val
 * @returns {boolean}
 */
function isNestedWithDtmArray(val) {
    var res = false;
    if (isArray(val)) {
        res = val.some(function (v) {
            return isDtmArray(v);
        });
    }
    return res;
}

function getMaxArrayDepth(val) {
    if (isArray(val)) {
        var depth = 1;
        var list = [];

        for (var i = 0, l = val.length; i < l; i++) {
            if (isArray(val[i])) {
                list.push(getMaxArrayDepth(val[i]));
            } else if (isDtmArray(val[i])) {
                list.push(getMaxDtmArrayDepth(val[i]));
            }
        }

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }
        return depth;
    } else {
        return 0;
    }
}

function getMaxDtmArrayDepth(val) {
    if (isDtmArray(val)) {
        var depth = 1;
        var list = [];

        if (isNestedDtmArray(val)) {
            val.each(function (v) {
                if (isDtmArray(v)) {
                    list.push(getMaxDtmArrayDepth(v));
                }
            });
        }

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }
        return depth;
    } else {
        return 0;
    }
}

function getMaxDepth(arr) {
    var depth, list, i, l;
    if (isArray(arr)) {
        depth = 1;
        list = [];

        for (i = 0, l = arr.length; i < l; i++) {
            if (isArray(arr[i]) || isDtmArray(arr[i])) {
                list.push(getMaxDepth(arr[i]));
            }
        }

        if (list.length > 0) {
            depth += Math.max.apply(this, list);
        }

        return depth;
    } else if (isDtmArray(arr)) {
        // depth = 1;
        // list = [];
        //
        // for (i = 0, l = arr.val.length; i < l; i++) {
        //     if (isArray(arr.val[i]) || isDtmArray(arr.val[i])) {
        //         list.push(getMaxDepth(arr.val[i]));
        //     }
        // }
        //
        // if (list.length > 0) {
        //     depth += Math.max.apply(this, list);
        // }
        //
        // return depth;
        return arr.params.depth;
    } else {
        return 0;
    }
}

/**
 * Checks if the value is an instance of DTM object
 * @param val
 * @returns {boolean}
 */
function isDtmObj(val) {
    if (isObject(val) || typeof(val) === 'function') {
        return val.hasOwnProperty('meta');
    } else {
        return false;
    }
}

function isDtmSynth(val) {
    if (isObject(val) || typeof(val) === 'function') {
        if (val.hasOwnProperty('meta')) {
            return val.meta.type === 'dtm.synth' || val.meta.type === 'dtm.music';
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function isDtmData(val) {
    if (isObject(val) || typeof(val) === 'function') {
        if (val.hasOwnProperty('meta')) {
            return (val.meta.type === 'dtm.data' || val.meta.type === 'dtm.generator');
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function isNestedDtmData(val) {
    if (isDtmData(val)) {
        return val.every(function (v) {
            return isDtmData(v);
        });
    } else {
        return false;
    }
}

function isNumDtmData(obj) {
    return isDtmData(obj) && isNumOrFloat32Array(obj.get());
}

function isNestedNumDtmData(obj) {
    return isNestedDtmData(obj) && obj.get().every(function (a) { return isNumDtmData(a)});
}

/**
 * Checks if the value is an instance of dtm.array
 * @param val
 * @returns {boolean}
 */
function isDtmArray(val) {
    if (isObject(val) || typeof(val) === 'function') {
        if (val.hasOwnProperty('meta')) {
            return ['dtm.array', 'dtm.data', 'dtm.generator'].indexOf(val.meta.type) !== -1;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Checks if the value is an instance of dtm.array with children dtm.arrays
 * @param val
 * @returns {boolean}
 */
function isNestedDtmArray(val) {
    if (isDtmArray(val)) {
        return val.params.nested;
        // return val.every(function (v) {
        //     return isDtmArray(v);
        // });
    } else {
        return false;
    }
}

function isNumDtmArray(obj) {
    return isDtmArray(obj) && isNumOrFloat32Array(obj.get());
}

function isNestedNumDtmArray(obj) {
    return isNestedDtmArray(obj) && obj.get().every(function (a) { return isNumDtmArray(a)});
}

/**
 * Checks if the value is a string array
 * @param val
 * @returns {boolean}
 */
function isStringArray(val) {
    var res = false;
    if (isArray(val)) {
        res = val.every(function (v) {
            return isString(v);
        });
    }
    return res;
}

/**
 * Checks if the value is a boolean array
 * @param val
 * @returns {boolean}
 */
function isBoolArray(val) {
    var res = false;
    if (isArray(val)) {
        res = val.every(function (v) {
            return isBoolean(v);
        });
    }
    return res;
}

/**
 * Checks if the given array has any "empty" values
 * @param array
 * @returns {boolean}
 */
function hasMissingValues(array) {
    // assuming the input is an array with length > 0
    return array.some(function (v) {
        return isEmpty(v);
    });
}

// TODO: implement
function arrayCompare(first, second) {

}

function objCompare(first, second) {
    var res = false;
    if (isFunction(first) && isFunction(second)) {
        return first.toString() === second.toString();
    } else if (isObject(first) && isObject(second)) {
        return JSON.stringify(first) === JSON.stringify(second);
    }

    return res;
}

/**
 * Converts the arguments object into a regular array
 * @param args {object} The arguments object of the caller function
 * @returns {Array}
 */
function argsToArray(args) {
    var res = [];
    for (var i = 0; i < args.length; i++) {
        res[i] = args[i];
    }
    return res;
}

/**
 * Iterates over the arguments object of the caller function
 * @param args {object} The arguments object
 * @param fn {function} A callback function with same arguments of Array.forEach
 */
function argsForEach(args, fn) {
    for (var i = 0, l = args.length; i < l; i++) {
        fn.apply(this, args[i]);
    }
}

/**
 * Checks if the arguments object consist of a single array item
 * @param args {object} The arguments object
 * @returns {boolean}
 */
function argIsSingleArray(args) {
    return (args.length === 1 && isArray(args[0]));
}

function argsAreSingleVals(args) {
    var res = false;
    if (!argIsSingleArray(args) && args.length > 0) {
        var argsArr = argsToArray(args);
        res = argsArr.every(function (a) {
            return isSingleVal(a);
        });
    }
    return res;
}

/**
 * Converts various number or array types into a Float32Array. Returns null if not convertible.
 * @param src
 * @returns {Float32Array|null}
 */
function toFloat32Array(src) {
    if (isNumber(src)) {
        return new Float32Array([src]);
    } else if (isDtmObj(src)) {
        if (isDtmArray(src)) {
            if (isNumArray(src.get())) {
                return new Float32Array(src.get());
            } else if (isFloat32Array(src.get())) {
                return src.get();
            } else if (isNestedWithDtmArray(src.get())) {
                return toFloat32Array(src.get('next')); // TODO: may not be ideal
            }
        } else if (src.meta.type === 'dtm.model') {
            return new Float32Array(src.get());
        }
    } else if (isNumOrFloat32Array(src)) {
        if (isFloat32Array(src)) {
            return src;
        } else {
            // var typedArray = new Float32Array(src.length);
            // for (var i = 0, l = src.length; i < l; i++) {
            //     typedArray[i] = src[i];
            // }
            // return typedArray;
            return new Float32Array(src);
        }
    } else {
        return null;
    }
}

// TODO: test
function fromFloat32Array(src) {
    return Array.prototype.slice.call(src);
}

function Float32Concat(first, second) {
    var firstLen = first.length;
    var res = new Float32Array(firstLen + second.length);

    res.set(first);
    res.set(second, firstLen);

    return res;
}

// TODO: other concat types (e.g., string array + typed array)
function concat(first, second) {
    if (isFloat32Array(first) || isFloat32Array(second)) {
        if (isNumber(first)) {
            first = new Float32Array([first]);
        }
        if (isNumber(second)) {
            second = new Float32Array([second]);
        }

        return Float32Concat(first, second);
    } else {
        return first.concat(second);
    }
}

function flatten(nestedArray) {
    var res = [];
    for (var i = 0, l = nestedArray.length; i < l; i++) {
        if (isArray(nestedArray[i])) {
            res = concat(res, flatten(nestedArray[i]));
        } else {
            res = concat(res, nestedArray[i]);
        }
    }
    return res;
}

function Float32Splice(array, start, deleteCount) {
    console.log(array.length - deleteCount);
    var res = new Float32Array(array.length - deleteCount);
    var temp = Array.prototype.slice.call(array);
    temp.splice(start, deleteCount);
    res.set(temp);

    return res;
}

function splice(array, start, deleteCount) {
    if (isFloat32Array(array)) {
        return Float32Splice(array, start, deleteCount);
    } else {
        array.splice(start, deleteCount);
        return array;
    }
}

function truncateDigits(value) {
    var digits = 10;
    return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
}

function Float32Map(array, cb) {
    var res = new Float32Array(array.length);

    for (var i = 0, l = array.length; i < l; i++) {
        res[i] = cb(array[i]);
    }

    return res;
}

function deferCallback(cb, time) {
    var defer = 0;
    if (isNumber(time) && time > 0) {
        defer = time;
    }

    if (isFunction(cb)) {
        return function () {
            var args = arguments;
            setTimeout(function () {
                cb.apply(this, args);
            }, defer);
        }
    }
}

function cloneArray(input) {
    if (isArray(input) || isFloat32Array(input)) {
        return input.slice(0);
    }
}

function print(input) {
    var formatted = null;
    if (isNestedDtmArray(input) || isNestedWithDtmArray(input)) {
        input.forEach(function (a) {
            console.log(a.get('name'), a.get());
        });
    } else if (isDtmArray(input)) {
        console.log(input.get('name'), input.get());
    } else {
        console.log(input);
    }
    return input;
}

//function append() {
//
//}
//
//function appendNoDupes() {
//
//}

function objForEach(obj, callback) {
    var res = [];
    if (typeof(obj) === 'object') {
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && typeof(callback) === 'function') {
                res.push(callback(obj[key], key));
            }
        }
        return res;
    }
}

function numProperties(obj) {
    var count = 0;
    if (isObject(obj)) {
        objForEach(obj, function () {
            count++;
        });
    }
    return count;
}

function loadBuffer(arrayBuf) {
    var buffer = {};
    actx.decodeAudioData(arrayBuf, function (buf) {
        buffer = buf;
    });

    return buffer;
}

/**
 * Returns the minimum value of numeric array.
 * @param arr {number}
 * @returns {number}
 */
function getMin(arr) {
    if (isNumOrFloat32Array(arr)) {
        return Math.min.apply(this, arr);
    }
}

/**
 * Returns the maximum value of numeric array.
 * @param arr {number}
 * @returns {number}
 */
function getMax(arr) {
    if (isNumOrFloat32Array(arr)) {
        return Math.max.apply(this, arr);
    }
}

/**
 * Returns the mean of a numeric array.
 * @param arr {array} Input numerical array.
 * @returns val {number} Single mean value.
 * @example
 *
 * dtm.transform.mean([8, 9, 4, 0, 9, 2, 1, 6]);
 * -> 4.875
 */
function mean(arr) {
    if (isNumOrFloat32Array(arr)) {
        return sum(arr) / arr.length;
    }
}

function centroid(arr) {
    if (arr.length === 1) {
        return 0.5;
    }

    var weightedSum = 0;
    for (var i = 0, l = arr.length; i < l; i++) {
        weightedSum += arr[i] * i;
    }

    return weightedSum / sum(arr) / (arr.length-1);
}

/**
 * Returns the most frequent value of the array.
 * @param arr {array}
 * @returns {value}
 */
function mode(arr) {
    var uniqs = unique(arr);
    var max = 0;
    var num = 0;
    var res = null;

    var histo = countOccurrences(arr);

    for (var i = 0, l = uniqs.length; i < l; i++) {
        num = histo[uniqs[i]];

        if (num > max) {
            res = uniqs[i];
            max = num;
        }
    }

    return res;
}

/**
 * Returns the median of numerical array.
 * @param arr
 * @returns {number}
 */
function median(arr) {
    var sorted = arr.sort();
    var len = arr.length;

    if (mod(len, 2) === 0) {
        return (sorted[len/2 - 1] + sorted[len/2]) / 2
    } else {
        return sorted[Math.floor(len/2)];
    }
}

/**
 * Returns the midrange of numerical array.
 * @param arr
 * @return {number}
 */
function midrange(arr) {
    var max = getMax(arr);
    var min = getMin(arr);
    return (max + min) / 2;
}

/**
 * Simple summation.
 * @param arr
 * @returns {number}
 */
function sum(arr) {
    if (isNestedWithDtmArray(arr)) {
        return sum(arr.map(function (a) {
            return sum(a.get());
        }))
    } else {
        return arr.reduce(function (num, sum) {
            return num + sum;
        });

        // var data = new Float32Array(arr);
        // var ptr = Module._malloc(data.byteLength);
        // var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
        // view.set(data);
        //
        // var res = Module.ccall('sum', null, ['number', 'number'], [ptr, data.length]);
        //
        // Module._free(ptr);
        // return res;
    }
}

/**
 * Variance.
 * @param arr
 * @returns {*}
 */
function variance(arr) {
    var meanVal = mean(arr);

    var res = [];

    for (var i = 0, l = arr.length; i < l; i++) {
        res[i] = Math.pow((meanVal - arr[i]), 2);
    }

    // TODO: divide-by-zero error
    return sum(res) / (arr.length-1);
}

/**
 * Standard Deviation.
 * @param arr
 * @returns {*}
 */
function std(arr) {
    return Math.sqrt(variance(arr));
}

/**
 * Population Variance.
 * @param arr
 * @returns {*}
 */
function pvar(arr) {
    var meanVal = mean(arr);

    var res = [];

    for (var i = 0, l = arr.length; i < l; i++) {
        res[i] = Math.pow((meanVal - arr[i]), 2);
    }

    return mean(res);
}

/**
 * Population Standard Deviation.
 * @param arr
 * @returns {number}
 */
function pstd(arr) {
    return Math.sqrt(pvar(arr));
}

function meanSquare(arr) {
    var res = [];

    for (var i = 0, l = arr.length; i < l; i++) {
        res[i] = Math.pow(arr[i], 2);
    }

    return mean(res);
}

/**
 * Root-Mean-Square value of given numerical array.
 * @param arr {array}
 * @returns rms {number}
 */
function rms(arr) {
    var res = [];

    for (var i = 0, l = arr.length; i < l; i++) {
        res[i] = Math.pow(arr[i], 2);
    }

    return Math.sqrt(mean(res));
}

function unique(input) {
    var res = [];

    for (var i = 0, l = input.length; i < l; i++) {
        if (res.indexOf(input[i]) === -1) {
            res.push(input[i]);
        }
    }

    return res;
}

/**
 * Counts occurrences of each class in the list.
 * @param input {array}
 * @returns {array}
 */
function histo(input) {
    var res = [];
    var classes = cloneArray(input);
    var histogram = countOccurrences(input);

    for (var i = 0, l = classes.length; i < l; i++) {
        res[i] = histogram[classes[i]];
    }

    return res;
}

function countOccurrences(input) {
    var res = {};
    for (var i = 0, l = input.length; i < l; i++) {
        if (!res.hasOwnProperty(input[i])) {
            res[input[i]] = 1;
        } else {
            res[input[i]]++;
        }
    }
    return res;
}

/**
 * List unique items as "class" in sorted order.
 * @param input {array}
 * @returns {array}
 */
function listClasses(input) {
    return unique(input).sort();
}

function uniformity(input) {
    return listClasses(input).length / input.length;
}

function intersection(arr1, arr2) {
    return arr1.filter(function (n) {
        return arr2.indexOf(n) !== -1;
    });
}

/* SINGLE-VALUE CALCULATION */
/**
 * Rescales a single normalized (0-1) value.
 *
 * @param val {float} Value between 0-1.
 * @param min {number} Target range minimum.
 * @param max {number} Target range maximum.
 * @param [round=false] {boolean} If true, the output will be rounded to an integer.
 * @returns {number}
 */
function rescale(val, min, max, round) {
    round = round || false;

    var res = val * (max - min) + min;

    if (round) {
        res = Math.round(res);
    }

    return res;
}

/**
 * @param val {float} Value between 0-1.
 * @param factor {float} Steepness. It should be above 1.
 * @returns {number}
 */
function expCurve(val, factor) {
    factor = factor <= 1 ? 1.000001 : factor;
    return (Math.exp(val * Math.log(factor)) - 1.) / (factor - 1.);
}

/**
 * @param val {float} Value between 0-1.
 * @param factor {float} Steepness. It should be above 1.
 * @returns {number}
 */
function logCurve(val, factor) {
    factor = factor <= 1 ? 1.000001 : factor;
    return (Math.log(val * (factor - 1.) + 1.)) / (Math.log(factor));
}

/**
 * MIDI note number to frequency conversion.
 * @param nn {number} Note number
 * @returns {number}
 */
function mtof(nn) {
    return 440.0 * Math.pow(2, (nn - 69) / 12.);
}

/**
 * Frequency to MIDI note number conversion.
 * @param freq {number} Note number
 * @returns {number}
 */
function ftom(freq) {
    return Math.log2(freq / 440.0) * 12 + 69;
}

/**
 * Scale or pitch-quantizes the input value to the given models.scales.
 * @param nn {number} Note number
 * @param scale {array} An array of either number or string
 * @param [round=false] {boolean}
 * @returns {*}
 */
function pq(nn, scale, round) {
    var solfa = {
        0: ['do', 'd'],
        1: ['di', 'ra'],
        2: ['re', 'r'],
        3: ['ri', 'me'],
        4: ['mi', 'm', 'fe'],
        5: ['fa', 'f'],
        6: ['fi', 'se'],
        7: ['sol', 's'],
        8: ['si', 'le'],
        9: ['la', 'l'],
        10: ['li', 'te'],
        11: ['ti', 't', 'de']
    };

    var sc = [];

    if (isNumOrFloat32Array(scale)) {
        sc = scale;
    } else if (isStringArray(scale)) {
        scale.forEach(function (v) {
            objForEach(solfa, function (deg, key) {
                if (deg.indexOf(v.toLowerCase()) > -1) {
                    sc.push(parseInt(key));
                }
            });
        })
    } else if (!isArray(scale)) {
        sc = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }

    if (isEmpty(round)) {
        round = false;
    }

    var pc = mod(nn, 12);
    var oct = nn - pc;
    var idx = Math.floor(pc / 12. * sc.length);
    var frac = 0.0;

    if (!round) {
        frac = mod(nn, 1);
    }
    return oct + sc[idx] + frac;
}

/**
 * A modulo (remainder) function.
 * @param n {number} Divident
 * @param m {number} Divisor
 * @returns {number}
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}

function randi(arg1, arg2) {
    var min, max;
    if (!isNumber(arg1) && !isNumber(arg2)) {
        min = 0.0;
        max = 1.0;
    } else if (isNumber(arg1) && !isNumber(arg2)) {
        min = 0.0;
        max = arg1;
    } else if (isNumber(arg1) && isNumber(arg2)) {
        min = arg1;
        max = arg2;
    }

    return Math.floor(Math.random() * (max - min) + min);
}

function random(arg1, arg2) {
    var min, max;
    if (!isNumber(arg1) && !isNumber(arg2)) {
        min = 0.0;
        max = 1.0;
    } else if (isNumber(arg1) && !isNumber(arg2)) {
        min = 0.0;
        max = arg1;
    } else if (isNumber(arg1) && isNumber(arg2)) {
        min = arg1;
        max = arg2;
    }

    return Math.random() * (max - min) + min;
}

// a slight modification of https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    var cost = a[0] !== b[0] ? 1 : 0;

    return Math.min(
        levenshteinDistance(a.substr(1), b) + 1,
        levenshteinDistance(b.substr(1), a) + 1,
        levenshteinDistance(a.substr(1), b.substr(1)) + cost
    );
}

function alloc(arr) {
    var data = new Float32Array(arr);
    var ptr = Module._malloc(data.byteLength);
    var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
    view.set(data);
}

function free(ptr) {
    Module._free(ptr);
}

//function clone(obj) {
//    var copy;
//
//    // Handle the 3 simple types, and null or undefined
//    if (null == obj || "object" != typeof obj) {
//        return obj;
//    }
//
//    // Handle Date
//    if (obj instanceof Date) {
//        copy = new Date();
//        copy.setTime(obj.getTime());
//        return copy;
//    }
//
//    // Handle Array
//    if (obj instanceof Array) {
//        copy = [];
//        for (var i = 0, len = obj.length; i < len; i++) {
//            copy[i] = clone(obj[i]);
//        }
//        return copy;
//    }
//
//    // Handle Object
//    if (obj instanceof Object) {
//        if (isDtmArray(obj)) {
//            return obj.clone();
//        } else {
//            copy = {};
//            for (var attr in obj) {
//                if (obj.hasOwnProperty(attr)) {
//                    copy[attr] = clone(obj[attr]);
//                }
//            }
//            return copy;
//        }
//    }
//
//    throw new Error("Unable to copy obj! Its type isn't supported.");
//}

function clone(src) {
    return Object.assign({}, src);
}

function jsonp(url, cb) {
    var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[cbName] = function (data) {
        delete window[cbName];
        document.body.removeChild(script);
        var keys = Object.keys(data);
        keys.forEach(function (val) {
            if (val !== 'response') {
                console.log(data[val]);
            }
        });
        //cb(data);
    };

    var script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
    document.body.appendChild(script);
}

function ajaxGet(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'text/xml');
    xhr.setRequestHeader('Content-Type', 'application/html');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    xhr.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With");

    //req.setRequestHeader("Access-Control-Max-Age", "3600");


    var ext = url.split('.').pop();

    switch (ext) {
        case 'txt':
        case 'csv':
//            req.responseType = 'blob';
            break;
        case 'json':
            //xhr.responseType = 'json';
            break;
        case 'wav':
        case 'aif':
        case 'aiff':
        case 'ogg':
        case 'mp3':
            xhr.responseType = 'arraybuffer';
            break;

        case 'html':
            xhr.responseType = 'document';
            break;
        default:
            xhr.responseType = 'blob';
            break;
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //cb(xhr.response);
            console.log(xhr.response);
        } else {
            //console.log(xhr.status);
        }
    };

    xhr.send();
}

dtm.util = {};

/* TYPE CHECKING */
dtm.util.isNaNfast = isNaNfast;
dtm.util.isEmpty = isEmpty;
dtm.util.isNumber = isNumber;
dtm.util.isInteger = isInteger;
dtm.util.isString = isString;
dtm.util.isBoolean = isBoolean;
dtm.util.isFunction = isFunction;
dtm.util.isPromise = isPromise;
dtm.util.isObject = isObject;
dtm.util.isSingleVal = isSingleVal;
dtm.util.isArray = isArray;
dtm.util.isFloat32Array = isFloat32Array;
dtm.util.isNumArray = isNumArray;
dtm.util.isNumOrFloat32Array = isNumOrFloat32Array;
dtm.util.isParsableNumArray = isParsableNumArray;
dtm.util.isObjArray = isObjArray;
dtm.util.isMixedArray = isMixedArray;
dtm.util.isStringArray = isStringArray;
dtm.util.isBoolArray = isBoolArray;
dtm.util.isNestedArray = isNestedArray;
dtm.util.isNestedWithDtmArray = isNestedWithDtmArray;
dtm.util.isDtmObj = isDtmObj;
dtm.util.isDtmSynth = isDtmSynth;
dtm.util.isDtmArray = isDtmArray;
dtm.util.isNestedDtmArray = isNestedDtmArray;
dtm.util.isNumDtmArray = isNumDtmArray;
dtm.util.isNestedNumDtmArray = isNestedNumDtmArray;
dtm.util.argIsSingleArray = argIsSingleArray;
dtm.util.argsAreSingleVals = argsAreSingleVals;

/* ANALYSIS */
dtm.util.getMaxArrayDepth = getMaxArrayDepth;
dtm.util.getMaxDtmArrayDepth = getMaxDtmArrayDepth;
dtm.util.getMaxDepth = getMaxDepth;
dtm.util.hasMissingValues = hasMissingValues;
//dtm.util.arrayCompare = arrayCompare;
dtm.util.numProperties = numProperties;

dtm.util.getMin = getMin;
dtm.util.getMax = getMax;
dtm.util.mean = mean;
dtm.util.mode = mode;
dtm.util.midrange = midrange;
dtm.util.sum = sum;
dtm.util.variance = variance;
dtm.util.pvar = pvar;
dtm.util.std = std;
dtm.util.pstd = pstd;
dtm.util.rms = rms;
dtm.util.unique = unique;
dtm.util.histo = histo;
dtm.util.countBy = countOccurrences;
dtm.util.listClasses = listClasses;
dtm.util.uniformity = uniformity;
dtm.util.intersection = intersection;

/* CONVERSION */
dtm.util.argsToArray = argsToArray;
dtm.util.toFloat32Array = toFloat32Array;
dtm.util.fromFloat32Array = fromFloat32Array;

/* SINGLE-VALUE CALCULATION */
dtm.util.mod = mod;
dtm.util.mtof = mtof;
dtm.util.ftom = ftom;

/* LIST OPERATION */
dtm.util.Float32Concat = Float32Concat;
dtm.util.concat = concat;
dtm.util.Float32splice = Float32Splice;
dtm.util.splice = splice;

/* ITERATION */
dtm.util.argsForEach = argsForEach;
dtm.util.objForEach = objForEach;
dtm.util.Float32Map = Float32Map;

/* MISC */
dtm.util.truncateDigits = truncateDigits;
dtm.util.deferCallback = deferCallback;
dtm.util.cloneArray = cloneArray;
dtm.util.print = print;
dtm.osc = {
    type: 'dtm.osc',
    oscPort: null,
    isOn: false,
    isOpen: false,
    callbacks: [],

    start: function () {
        if (typeof(osc) !== 'undefined' && !dtm.osc.isOpen) {
            dtm.osc.isOpen = true;
            dtm.log('opening OSC port');

            dtm.osc.oscPort = new osc.WebSocketPort({
                url: 'ws://localhost:8081'
            });

            dtm.osc.oscPort.open();

            dtm.osc.oscPort.listen();

            dtm.osc.oscPort.on('ready', function () {
                //dtm.osc.oscPort.socket.onmessage = function (e) {
                //    console.log('test');
                //    var foo =String.fromCharCode.apply(null, new Uint16Array(e));
                //    console.log("message", e);
                //};

                dtm.osc.oscPort.on('message', function (msg) {
                    switch (msg.address) {
                        case '/test':
                            //console.log(msg.args[0]);
                            break;
                        default:
                            break;
                    }
                });

                dtm.osc.oscPort.on("error", function (err) {
                    throw new Error(err);
                });
            });
        } else if (dtm.osc.isOpen) {
            dtm.log('OSC port is already open');
        }

        return dtm.osc;
    },

    stop: function () {
        if (dtm.osc.oscPort) {
            dtm.osc.oscPort.close(1000);
        }

        dtm.osc.isOpen = false;
        return dtm.osc;
    },


    on: function (addr, cb) {
        dtm.osc.oscPort.on('message', function (msg) {
            if (addr[0] !== '/') {
                addr = '/'.concat(addr);
            }
            if (msg.address == addr) {
                cb(msg.args);
            }
        });
        return dtm.osc;
    },

    send: function (addr, args) {
        if (addr[0] !== '/') {
            addr.unshift('/');
        }

        if (args.constructor !== Array) {
            args = [args];
        }

        dtm.osc.oscPort.send({
            address: addr,
            args: args
        });

        return dtm.osc;
    },

    clear: function () {
        dtm.osc.callbacks = [];
    }
};

dtm.osc.close = dtm.osc.stop;


/**
 * @fileOverview Utility functions for single-dimensional arrays. Singleton.
 * @module transform
 */

// singleton helper functions
dtm.transform = {
    /* SCALERS */

    /**
     * Normalizes an numerical array into 0-1 range.
     * @function module:transform#normalize
     * @param arr {array} One-dimensional numerical array.
     * @param [min] {number} Prefered domain minimum value. If not present, the minimum of the input array is used.
     * @param [max] {number} Prefered domain maximum value. If not present, the maximum of the input array is used.
     * @returns {array} Normalized numerical array.
     * @example
     *
     * var seq = [-10, 1, -6, 1, -9, 10, -8, 8];
     *
     * dtm.transform.normalize(seq);
     * -> [0, 0.55, 0.2, 0.55, 0.05, 1, 0.1, 0.9]
     */
    normalize: function (arr, min, max) {
        if (isNumOrFloat32Array(arr)) {
            if (!isNumber(min)) {
                min = getMin(arr);
            }

            if (!isNumber(max)) {
                max = getMax(arr);
            }

            var denom = 1;

            if (max === min) {
                if (min > 0 && min <= 1) {
                    min = 0;
                } else if (min > 1) {
                    min -= 1;
                }
            } else {
                denom = max - min;
            }

            return arr.map(function (val) {
                return (val - min) / denom;
            });
        }
    },
    // normalize: function (arr, min, max) {
    //     if (!isNumber(min)) {
    //         min = getMin(arr);
    //     }
    //
    //     if (!isNumber(max)) {
    //         max = getMax(arr);
    //     }
    //
    //     var data = new Float32Array(arr);
    //     var ptr = Module._malloc(data.byteLength);
    //     var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
    //     view.set(data);
    //
    //     Module.ccall('normalize', null, ['number', 'number', 'number', 'number'], [ptr, data.length, min, max]);
    //
    //     Module._free(ptr);
    //     return view;
    // },

    fft: function (arr) {
        var data = new Float32Array(arr);
        var ptr = Module._malloc(data.byteLength);
        var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
        view.set(data);

        Module.ccall('fft', null, ['number', 'number'], [ptr, data.length]);

        Module._free(ptr);
        return view;
    },

    /**
     * Modifies the range of an array.
     * @function module:transform#rescale
     * @param arr {array}
     * @param min {number}
     * @param max {number}
     * @param [dmin] {number}
     * @param [dmax] {number}
     * @returns array {array}
     * @example
     *
     * dtm.transform.rescale([2, 1, 8, 9, 1, 3, 6, 9], -1, 1);
     * -> [-0.75, -1, 0.75, 1, -1, -0.5, 0.25, 1]
     */
    rescale: function (arr, min, max, dmin, dmax) {
        var normalized = dtm.transform.normalize(arr, dmin, dmax);
        var res = [];

        for (var i = 0, l = normalized.length; i < l; i++) {
            res[i] = truncateDigits(rescale(normalized[i], min, max));
        }

        return res;
    },

    /**
     * Applies an exponential curve to a normalized (0-1) array.
     * @function module:transform#expCurve
     * @param arr
     * @param [factor=1] {number}
     * @returns {Array}
     */
    expCurve: function (arr, factor) {
        factor = factor || 1;
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            res[i] = expCurve(arr[i], factor);
        }

        return res;
    },

    /**
     * Applies a logarithmic curve to a normalized (0-1) array.
     * @function module:transform#logCurve
     * @param arr
     * @param [factor=1] {number}
     * @returns {Array}
     */
    logCurve: function (arr, factor) {
        factor = factor || 1;
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            res[i] = logCurve(arr[i], factor);
        }

        return res;
    },

    /**
     * Stretches or shrinks the input numerical array to a target length.
     * @function module:transform#fit
     * @param arr {array} Input numerical array.
     * @param len {number} Target length.
     * @param [interp='linear'] {string} Interpolation mode. Choices: 'linear', 'step', 'zeros'
     * @returns {array}
     * @example
     * var input = [2, 6, -3, 9];
     *
     * dtm.transform.fit(input, 6);
     * -> [2, 4.4, 4.2, -1.2, 1.8, 9]
     *
     * @example
     * var input = [1, -2, -6, 6];
     *
     * dtm.transform.fit(input, 3);
     * -> [1, -4, 6]
     */
    fit: function (arr, len, interp) {
        // interp: step, linear, cubic, etc.
        interp = interp || 'linear';

        if (len < 1) {
            len = 1;
        } else {
            len = Math.round(len);
        }

        var res = null;
        if (isNumArray(arr)) {
            res = new Array(len);
        } else if (isFloat32Array(arr)) {
            res = new Float32Array(len);
        } else {
            return null;
        }

        var i = 0;
        //res.length = len;
        var mult = len / arr.length;

        var inNumItv = arr.length - 1;
        var outNumItv = len - 1;
        var intermLen = inNumItv * outNumItv + 1;

        if (interp === 'linear' && intermLen > 104857600) {
            interp = 'step';
        }

        switch (interp) {
            default:
            case 'linear':
                var intermArr = null;

                if (isNumArray(arr)) {
                    intermArr = new Array(intermLen);
                } else if (isFloat32Array(arr)) {
                    intermArr = new Float32Array(intermLen);
                }

                var c = 0;
                for (var j = 0; j < inNumItv; j++) {
                    for (i = 0; i < outNumItv; i++) {
                        intermArr[c] = arr[j] + (arr[j + 1] - arr[j]) * (i / outNumItv);
                        c++;
                    }
                }
                intermArr[c] = arr[j];

                for (var k = 0; k < outNumItv; k++) {
                    res[k] = intermArr[k * inNumItv];
                }
                res[k] = intermArr[intermLen - 1];

                // TODO: not working correctly with data.map
                // var data = new Float32Array(len);
                // data.set(arr);
                // var ptr = Module._malloc(data.byteLength);
                // var view = new Float32Array(Module.HEAPF32.buffer, ptr, data.length);
                // view.set(data);
                //
                // Module.ccall('linearInterp', null, ['number', 'number', 'number'], [ptr, arr.length, len]);
                //
                // Module._free(ptr);
                // res = view;
                break;

            case 'step':
            case 'hold':
                for (i = 0; i < len; i++) {
                    res[i] = arr[Math.floor(i / mult)];
                }
                break;
            case 'zeros':
            case 'zeroes':
                var prevIdx = -1;

                for (i = 0; i < len; i++) {
                    if (prevIdx !== Math.floor(i / mult)) {
                        prevIdx = Math.floor(i / mult);
                        res[i] = arr[prevIdx];
                    } else {
                        res[i] = 0;
                    }
                }
                break;
            case 'decay':
                break;

            case 'cos':
            case 'cosine':
                if (arr.length >= len) {
                    res = dtm.transform.fit(arr, len, 'linear');
                } else {
                    var i = 0;
                    for (var p = 0; p < (arr.length-1); p++) {
                        var curX = p * Math.ceil(len/(arr.length-1));
                        var curY = arr[p];
                        var nextX = (p+1) * Math.ceil(len/(arr.length-1));
                        var nextY = arr[p+1];

                        for (var k = curX; k < nextX; k++) {
                            var ratio = (k - curX) / (nextX - 1 - curX);
                            var mu2 = (1 - Math.cos(ratio * Math.PI)) / 2.0;
                            res[i] = curY * (1 - mu2) + nextY * mu2;
                            i++;
                        }
                    }
                }
                break;
            case 'cubic':
                if (arr.length >= len) {
                    res = dtm.transform.fit(arr, len, 'linear');
                } else {
                    var i = 0;
                    for (var p = 0; p < (arr.length-1); p++) {
                        var curX = p * Math.ceil(len / (arr.length-1));
                        var curY = arr[p];
                        var nextX = (p + 1) * Math.ceil(len / (arr.length-1));
                        var nextY = arr[p + 1];

                        var y0 = 0;
                        var y1 = curY;
                        var y2 = nextY;
                        var y3 = 0;

                        if (p === 0) {
                            y0 = arr[arr.length-1];
                            y3 = arr[p+2];
                        } else if (p === arr.length-2) {
                            y0 = arr[p-1];
                            y3 = arr[0];
                        } else {
                            y0 = arr[p-1];
                            y3 = arr[p+2];
                        }

                        var a0 = y3 - y2 - y0 + y1;
                        var a1 = y0 - y1 - a0;
                        var a2 = y2 - y0;
                        var a3 = y1;

                        for (var k = curX; k < nextX; k++) {
                            var mu = (k - curX) / (nextX - 1 - curX);
                            var mu2 = mu * mu;
                            res[i] = a0*mu*mu2 + a1*mu2 + a2*mu + a3;
                            i++;
                        }
                    }
                }
                break;

            case 'pad':
                break;
        }
        return res;
    },

    /**
     * Stretches or shrinks the input array by the given factor.
     * @function module:transform#stretch
     * @param arr {array} Input numerical array.
     * @param factor {number} Time stretching factor. Should be positve.
     * @param [interp='linear'] {string} Interpolation mode. Choices: 'linear', 'step', 'zeros'
     * @returns {array}
     * @example
     *
     * var input = [4, -2, 4, 3];
     *
     * dtm.transform.stretch(input, 2.5);
     * -> [4, 2, 0, -2, 0, 2, 4, 3.666, 3.333, 3]
     */
    stretch: function (arr, factor, interp) {
        if (!isString(interp)) {
            interp = 'linear';
        }

        var targetLen = Math.round(arr.length * factor);
        if (targetLen == 0) {
            targetLen = 1;
        }

        return dtm.transform.fit(arr, targetLen, interp);
    },

    ola: function (arr, stretchFactor, blockSize, hopSize, window) {
        if (!isNumber(stretchFactor)) {
            stretchFactor = 1.0;
        } else {
            if (stretchFactor < 0.0) {
                stretchFactor = 1.0;
            }
        }
        if (isNumber(blockSize)) {
            blockSize = Math.round(blockSize);

            if (blockSize > arr.length) {
                blockSize = arr.length;
            } else if (blockSize < 1) {
                blockSize = 1;
            }
        }
        if (!isNumber(hopSize)) {
            hopSize = blockSize;
        } else {
            hopSize = Math.round(hopSize);
            if (hopSize < 1) {
                hopSize = 1;
            }
        }

        if (!isString(window)) {
            window = 'hamming'
        }

        var res = dtm.gen('zeros', Math.round(arr.length * stretchFactor));
        for (var i = 0; i < (arr.length - blockSize) / hopSize; i++) {

        }
    },

    limit: function (arr, min, max) {
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            var temp = arr[i];
            if (temp < min) {
                temp = min;
            }
            if (temp > max) {
                temp = max;
            }
            res[i] = temp;
        }
        return res;
    },

    fitSum: function (arr, tgt, round) {
        if (!isBoolean(round)) {
            round = false;
        }

        var summed = sum(arr);

        if (summed === 0) {
            arr = dtm.transform.add(arr, 0.000001);
            summed = sum(arr);
        }

        if (round) {
            tgt = Math.round(tgt);
        }

        var res = dtm.transform.mult(arr, 1/summed * tgt);

        if (round) {
            res = dtm.transform.round(res);

            if (sum(res) !== tgt) {
                var n = 1;
                var rem = sum(res) - tgt;
                var add = rem < 0;

                if (add) {
                    while (rem < 0) {
                        res[mod(arr.length-n, arr.length)]++;
                        rem++;
                        n++;
                    }
                } else {
                    while (rem > 0) {
                        if (res[arr.length-n] > 0) {
                            res[mod(arr.length-n, arr.length)]--;
                            rem--;
                            n++;
                        } else {
                            n++;
                        }
                    }
                }
            }
        }

        return res;
    },

    /**
     * Adds a value to the array contents. If the second argument is a number, it acts as a scalar value. If it is an array, it is first stretched with linear or specified interpolation method, then element-wise addition is performed.
     * @function module:transform#add
     * @param input {array}
     * @param factor {number|array}
     * @param [interp='linear] {string}
     * @returns {array}
     */
    add: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] + factor;
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] + factor[i];
            }
        }

        return res;
    },

    subtract: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] - factor;
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] - factor[i];
            }
        }

        return res;
    },

    /**
     * Multiplies the array contents. If the second argument is a number, it acts as a scalar value. If it is an array, it is first stretched with linear or specified interpolation method, then the dot product is returned.
     * @function module:transform#mult
     * @param input {array}
     * @param factor {number|array}
     * @param [interp='linear] {string}
     * @returns {array}
     */
    mult: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] * factor;
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] * factor[i];
            }
        }

        return res;
    },

    div: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] / factor;
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = input[i] / factor[i];
            }
        }

        return res;
    },

    /**
     * Power operation on the array contents. If the second argument is a number, it acts as a scalar value. If it is an array, it is first stretched with linear or specified interpolation method, then element-wise power operation is performed.
     * @function module:transform#pow
     * @param input {array} Base values.
     * @param factor {number|array} Exponent value or array.
     * @param [interp='linear'] {string}
     * @returns {Array}
     */
    pow: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.pow(input[i], factor);
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.pow(input[i], factor[i]);
            }
        }

        return res;
    },

    /**
     * @function module:transform#powof
     * @param input {array} Exponent values.
     * @param factor {number|array} Base value or array.
     * @param [interp='linear'] {string}
     * @returns {Array}
     */
    powof: function (input, factor, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(factor)) {
            factor = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(factor)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.pow(factor, input[i]);
            }
        } else if (isNumOrFloat32Array(factor)) {
            if (input.length > factor.length) {
                factor = dtm.transform.fit(factor, input.length, interp);
            } else if (input.length < factor.length) {
                input = dtm.transform.fit(input, factor.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.pow(factor[i], input[i]);
            }
        }

        return res;
    },

    log: function (input, base, interp) {
        var res = null;
        var i, l;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (isEmpty(base)) {
            base = Math.E;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        if (isNumber(base)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.log(input[i]) / Math.log(base);
            }
        } else if (isNumOrFloat32Array(base)) {
            if (input.length > base.length) {
                base = dtm.transform.fit(base, input.length, interp);
            } else if (input.length < base.length) {
                input = dtm.transform.fit(input, base.length, interp);
            }

            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.log(input[i]) / Math.log(base[i]);
            }
        }

        return res;
    },


    /* ARITHMETIC */

    /**
     * Rounds the float values to the nearest integer values or the nearest multiplication of the factor "to".
     * @function module:transform#round
     * @param input {array} Numerical array
     * @param to {number}
     * @returns {Array}
     */
    round: function (input, to) {
        var res = null;
        var i, l;
        if (isNumArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        if (!isNumber(to)) {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.round(input[i]);
            }
        } else {
            for (i = 0, l = input.length; i < l; i++) {
                res[i] = Math.round(input[i] / to) * to;
            }
        }
        return res;
    },

    /**
     * Floor quantizes the float values to the nearest integer values.
     * @function module:transform#round
     * @param input {array} Numerical array
     * @returns {Array}
     */
    floor: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = Math.floor(input[i]);
        }
        return res;
    },

    /**
     * Ceiling quantizes the float values to the nearest integer values.
     * @function module:transform#round
     * @param input {array} Numerical array
     * @returns {Array}
     */
    ceil: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = Math.ceil(input[i]);
        }
        return res;
    },

    hwr: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = (input[i] < 0) ? 0 : input[i];
        }

        return res;
    },

    fwr: function (input) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = (input[i] < 0) ? Math.abs(input[i]) : input[i];
        }

        return res;
    },

    mod: function (input, divisor) {
        var res = null;
        if (isArray(input)) {
            res = new Array(input.length);
        } else if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = mod(input[i], divisor);
        }

        return res;
    },

    removeZeros: function (input) {
        var res = [];

        for (var i = 0; i < input.length; i++) {
            if (input[i] !== 0) {
                res.push(input[i]);
            }
        }

        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return toFloat32Array(res);
        }
    },

    diff: function (input) {
        var res = [];

        for (var i = 1; i < input.length; i++) {
            res.push(input[i] - input[i-1]);
        }

        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return toFloat32Array(res);
        }
    },

    /* LIST OPERATIONS */

    /**
     * Creates a horizontal reverse of the input array.
     * @function module:transform#reverse
     * @param {array} input One-dimensional array. Could be any type.
     * @returns {array}
     * @example
     *
     * var input = [4, 1, 2, 7, 5, 0, 6, 3];
     *
     * dtm.transform.reverse(input);
     * -> [3, 6, 0, 5, 7, 2, 1, 4]
     */
    reverse: function (input) {
        var res = [];
        for (var i = input.length - 1; i >= 0; --i) {
            res.push(input[i]);
        }
        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return toFloat32Array(res);
        }
    },

    /**
     * Vertical invertion.
     * @function module:transform#invert
     * @param {array} input One-dimensional numerical array
     * @param {number} [center] If not present, the mean of the input array is used as the center point.
     * @returns {array}
     * @example
     *
     * var input = [4, 0, 3, 1, 2, 7, 5, 6];
     *
     * dtm.transform.invert(input);
     * -> [3, 7, 4, 6, 5, 0, 2, 1]
     */
    invert: function (input, center) {
        if (!isNumber(center)) {
            center = mean(input);
        }

        var res = [];

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = center - (input[i] - center);
        }
        if (isArray(input)) {
            return res;
        } else if (isFloat32Array(input)) {
            return toFloat32Array(res);
        }
    },

    /**
     * Randomizes the order of the contents of an array.
     * @function module:transform#shuffle
     * @param arr
     * @returns {Array}
     */
    shuffle: function (arr) {
        for (var i = arr.length-1; i >= 1; i--) {
            var j = Math.round(Math.random() * i);
            var temp = arr[j];
            arr[j] = arr[i];
            arr[i] = temp;
        }
        return arr;
    },

    /**
     * Sorts the contents of a numerical array.
     * @function module:transform#sort
     * @param arr {array}
     * @returns {array}
     */
    sort: function (arr) {
        var res = arr.sort(function (a, b) {
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            } else {
                return 0
            }
        });
        if (isFloat32Array(arr)) {
            return toFloat32Array(res);
        } else {
            return res;
        }
    },

    /**
     * Repeats the contents of an array.
     * @param input
     * @param count
     * @returns {Array}
     */
    repeat: function (input, count) {
        var res = [];

        if (!isInteger(count) || count < 1) {
            count = 1;
        }

        for (var i = 0; i < count; i++) {
            res = concat(res, input);
        }

        return res;
    },

    // TODO: it should just have one behavior
    /**
     * Truncates some values either at the end or both at the beginning and the end of the given array.
     * @function module:transform#truncate
     * @param arr {number}
     * @param arg1 {number}
     * @param [arg2]
     * @returns {Array}
     */
    truncate: function (arr, arg1, arg2) {
        var res = [];
        if (!isEmpty(arg2)) {
            for (var i = 0; i < (arr.length - (arg1 + arg2)); i++) {
                res[i] = arr[arg1 + i];
            }
        } else {
            for (var j = 0; j < (arr.length - arg1); j++) {
                res[j] = arr[j];
            }
        }
        return res;
    },

    getBlock: function (arr, start, size, wrap) {
        var res = [];
        var idx = 0;

        // TODO: non-wrapping zero-padded version
        for (var i = 0; i < size; i++) {
            idx = mod(i + start, arr.length);
            res[i] = arr[idx];
        }

        return res;
    },

    window: function (arr, type) {
        switch (type) {
            case 'rect':
            case 'rectangle':
            case 'rectangular':
                return arr;
            default:
                break;
        }
        var phase = 0;
        var res = null;
        if (isArray(arr)) {
            res = new Array(arr.length);
        } else if (isFloat32Array(arr)) {
            res = new Float32Array(arr.length);
        }

        for (var i = 0; i < arr.length; i++) {
            phase = i/(arr.length-1);

            switch (type) {
                case 'tri':
                case 'triangle':
                case 'triangular':
                    res[i] = arr[i] * (1 - Math.abs(phase * 2 - 1));
                    break;
                case 'hamm':
                case 'hamming':
                    var alpha = 0.54;
                    var beta = 0.46;
                    res[i] = arr[i] * (alpha - beta * Math.cos(2 * Math.PI * phase));
                    break;

                // maybe these are redundant
                case 'rect':
                case 'rectangle':
                case 'rectangular':
                default:
                    res[i] = arr[i];
                    break;
            }
        }

        return res;
    },

    //linslide: function (arr, up, down) {
    //    var res = [arr[0]];
    //
    //    if (!isInteger(up)) {
    //        up = 0;
    //    }
    //
    //    if (!isInteger(down)) {
    //        down = 0;
    //    }
    //
    //    for (var i = 1; i < arr.length; i++) {
    //        if (arr[i] < arr[i-1]) {
    //            res[i] = (arr[i-1] + arr[i]) / 2.0;
    //        } else {
    //            res[i] = arr[i];
    //        }
    //    }
    //    return res;
    //},

    /**
     * Shifts the positions of array contents.
     * @function module:transform#shift
     * @param arr
     * @param amount {number}
     * @returns {Array}
     */
    shift: function (arr, amount) {
        var res = [];

        for (var i = 0; i < arr.length; i++) {
            var j = mod((i + amount), arr.length);
            res[i] = arr[j];
        }
        return res;
    },

    /**
     * Variable length array morphing!
     * @function module:transform#morph
     * @param srcArr {array}
     * @param tgtArr {array}
     * @param [interp='linear'] {string}
     * @param [morphIdx=0.5] {float}
     */
    morph: function (srcArr, tgtArr, morphIdx, interp) {
        if (!isNumber(morphIdx)) {
            morphIdx = 0.5;
        }

        var srcLen = srcArr.length;
        var tgtLen = tgtArr.length;
        var resLen = Math.round((tgtLen - srcLen) * morphIdx + srcLen);

        return morphFixed(dtm.transform.fit(srcArr, resLen, interp), dtm.transform.fit(tgtArr, resLen), morphIdx);
    },

    /* UNIT CONVERTIONS */
    // CHECK: maybe should say Note To Beats
    /**
     * Converts a beat sequence (e.g. [1, 0, 1, 0]) into a sequence of note qualities.
     * @function module:transform#notesToBeats
     * @param input
     * @param resolution
     * @returns {Array}
     */
    notesToBeats: function (input, resolution) {
        var res = [];
        var idx = 0;

        for (var i = 0, l = input.length; i < l; i++) {
            var note = resolution / input[i];
            for (var j = 0; j < note; j++) {
                if (j === 0) {
                    res[idx] = 1;
                } else {
                    res[idx] = 0;
                }
                idx++;
            }
        }

        return res;
    },

    /**
     * Converts a periodic beat sequence into a note quality sequence.
     * @function module:transform#beatsToNotes
     * @param input
     * @param resolution
     * @returns {Array}
     */
    beatsToNotes: function (input, resolution) {
        var res = [];
        var prevVal = 0;
        var note = 1;
        var noteOn = false;

        for (var i = 0; i < input.length - 1; i++) {
            if (input[i + 1] !== 0) {
                res.push(resolution / note);
                note = 1;
            } else {
                note++;
            }
        }

        res.push(resolution / note);

        return res;
    },

    /**
     * Converts an interval sequence into a beat sequence.
     * @function module:transform#intervalToBeats
     * @param intervals {array}
     * @param ampseq {array}
     * @returns {Array}
     */
    intervalsToBeats: function (intervals, ampseq) {
        var res = [];
        var idx = 0;

        for (var i = 0, l = intervals.length; i < l; i++) {
            for (var j = 0; j < intervals[i]; j++) {
                if (j === 0) {
                    if (ampseq) {
                        res[idx] = ampseq[mod(i, ampseq.length)];
                    } else {
                        res[idx] = 1;
                    }
                } else {
                    res[idx] = 0;
                }
                idx++;
            }
        }

        return res;
    },

    /**
     * Converts a beat sequence into an interval sequence.
     * @function module:transform#beatsToIntervals
     * @param input
     * @returns {Array}
     */
    beatsToIntervals: function (input) {
        var res = [];
        var prevVal = 0;
        var note = 1;
        var noteOn = false;

        for (var i = 0; i < input.length - 1; i++) {
            if (input[i + 1] !== 0) {
                res.push(note);
                note = 1;
            } else {
                note++;
            }
        }

        res.push(note);

        return res;
    },

    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:transform#beatsToIndices
     * @param input
     * @returns {Array}
     */
    beatsToIndices: function (input) {
        var res = [];

        for (var i = 0; i < input.length; i++) {
            if (input[i] !== 0) {
                res.push(i);
            }
        }

        return res;
    },

    /**
     * @function module:transform#indicesToBeats
     * @param input
     * @param [seqLen] The length of the returned beat sequence. If not present, it will be the minimum power of two number to represent the beat sequence.
     */
    indicesToBeats: function (input, seqLen) {
        input = dtm.transform.sort(input);

        if (!isNumber(seqLen)) {
            var f = 0, len = 1;
            while (input[input.length-1] >= len) {
                len = Math.pow(2, ++f);
            }
        } else {
            len = seqLen;
        }

        var res = dtm.gen('const', 0).size(len).get();

        for (var i = 0; i < input.length; i++) {
            if (input[i] >= seqLen) {
                break;
            }

            res[input[i]] = 1;
        }

        return res;
    },

    calcBeatsOffset: function (src, tgt) {
        var res = [];
        var offset = 0;
        var countFromSrc = false;
        var countFromTgt = false;

        for (var i  = 0; i < src.length; i++) {
            if (src[i] === 1 && !countFromTgt) {
                countFromSrc = true;
            } else if (tgt[i] === 1 && !countFromSrc) {
                countFromTgt = true;
            }

            if (countFromSrc) {
                if (tgt[i] === 1) {
                    res.push(offset);
                    countFromSrc = countFromTgt = false;
                    offset = 0;
                } else {
                    offset++;
                }
            } else if (countFromTgt) {
                if (src[i] === 1) {
                    res.push(offset);
                    countFromSrc = countFromTgt = false;
                    offset = 0;
                } else {
                    offset--;
                }
            }
        }

        return res;
    },

    applyOffsetToBeats: function (src, offset) {
        var res = dtm.gen('zeroes', src.length).get();
        var curSelection = 0;

        for (var i = 0; i < src.length; i++) {
            if (src[i] === 1) {
                res[i + offset[curSelection]] = 1;
                curSelection++;
            }
        }

        return res;
    },

    /**
     * Analyzes the linear-regression evenness and modulates.
     * @function module:transform:lreModulation
     * @param input
     * @param degree
     */
    lreModulation: function (input, degree, mode) {
        var res = [];
        var nonZeros = 0;
        var curOnset = 0;
        var evenness = 0;

        for (var i = 0; i < input.length; i++) {
            res[i] = 0;

            if (input[i] !== 0) {
                nonZeros++;
            }
        }

        var unit = input.length / nonZeros;

        var intervals = [];
        for (var j = 0; j < input.length; j++) {
            if (input[j] !== 0) {
                var offset = j - unit * curOnset;
                intervals.push(Math.round(unit * curOnset + offset * (degree-0.5) * 2));
                curOnset++;
            }
        }

        for (var k = 0; k < intervals.length; k++) {
            var idx = intervals[k];
            if (idx < 0) {
                idx = 0;
            } else if (idx >= input.length) {
                idx = input.length - 1;
            }
            res[idx] = 1;
        }

        return res;
    },
    
    editDistance: function (array, target) {
        return array.map(function (v) {
            return levenshteinDistance(v, target);
        });
    },

    pitchQuantize: function (input, scale, round) {
        var res = [];

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = pq(input[i], scale, round);
        }

        return res;
    },

    // CHECK: redundant with analyzer.unique
    unique: function (input) {
        return unique(input);
    },

    classId: function (input) {
        var res = [];
        var sortedClasses = listClasses(input).sort();
        var classIds = {};

        for (var i = 0, l = sortedClasses.length; i < l; i++) {
            classIds[sortedClasses[i]] = i;
        }

        for (var j = 0, m = input.length; j < m; j++) {
            res[j] = classIds[input[j]];
        }

        return res;
    },

    stringify: function (input) {
        var res = [];
        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = input[i].toString();
        }

        return res;
    },

    tonumber: function (input) {
        var res = [];
        for (var i = 0, l = input.length; i < l; i++) {
            if (isString(input[i])) {
                res[i] = parseFloat(input[i]);
            } else if (isBoolean(input[i])) {
                res[i] = input[i] ? 1.0 : 0.0;
            } else {
                res[i] = NaN;
            }
        }
        return res;
    },

    mtof: function (input) {
        var res;

        if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        } else {
            res = new Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = mtof(input[i]);
        }
        return res;
    },

    ftom: function (input) {
        var res;

        if (isFloat32Array(input)) {
            res = new Float32Array(input.length);
        } else {
            res = new Array(input.length);
        }

        for (var i = 0, l = input.length; i < l; i++) {
            res[i] = ftom(input[i]);
        }
        return res;
    },

    split: function (input, separator) {
        if (!isString(separator)) {
            separator = '';
        }

        var res = [];
        if (isArray(input)) {
            for (var i = 0, l = input.length; i < l; i++) {
                if (isNumber(input[i])) {
                    input[i] = input[i].toString();
                }
                res = res.concat(input[i].split(separator));
            }
        }
        return res;
    },
    
    convolve: function () {
        
    }
};

/**
 * A shorthand for the notesToBeats() function.
 * @function module:transform#ntob
 */
dtm.transform.ntob = dtm.transform.notesToBeats;

/**
 * A shorthand for the beatsToNotes() function.
 * @function module:transform#bton
 */
dtm.transform.bton = dtm.transform.beatsToNotes;

/**
 * A shorthand for the intervalsToBeats() function.
 * @function module:transform#itob
 */
dtm.transform.itob = dtm.transform.intervalsToBeats;

/**
 * A shorthand for the beatsToIntervals() function.
 * @function module:transform#btoi
 */
dtm.transform.btoi = dtm.transform.beatsToIntervals;

dtm.transform.abs = dtm.transform.fwr;
dtm.transform.randomize = dtm.transform.shuffle;

function morphFixed (srcArr, tgtArr, morphIdx) {
    if (!isNumber(morphIdx)) {
        morphIdx = 0.5;
    }

    var newArr = [];

    for (var i = 0, l = srcArr.length; i < l; i++) {
        newArr[i] = (tgtArr[i] - srcArr[i]) * morphIdx + srcArr[i];
    }

    return newArr;
}

dtm.tr = dtm.transform;
/**
 * @fileOverview Single dimensional array with built-in transformation functions.
 * @module array
 */

/**
 * Creates a new single dimensional array object with various transformation functions. The same helper functions from dtm.array can be used - but make sure to skip the first argument (the input array) and start from the second argument.
 *
 * @function module:array.array
 * @returns array object {{value: null, normalized: null, length: null, min: null, max: null, mean: null}}
 */
dtm.array = function () {
    var fnList = [
        'label', 'parent',
        'morph', 'reset', 'save', 'residue', 'flush', 'clear',
        'normalize', 'n', 'range', 'r', 'limit', 'clip',
        'expcurve', 'expc', 'logcurve', 'logc',
        'fit', 'f', 'stretch', 'str', 's',
        'phase', 'interp',
        'line', 'step', 'cubic', 'cos',
        'freq', 'amp', 'gain', 'fir',
        'add', 'subtract', 'mult', 'dot', 'divide', 'div',
        'reciprocal', 'recip', 'pow', 'powof', 'log',
        'min', 'max', 'extent',
        'mean', 'avg', 'mode', 'median', 'midrange', 'mid',
        'std', 'pstd', 'var', 'pvar',
        'rms',
        'linreg', 'covar', 'cov', 'corr', 'amdf',
        'sum', 'fitsum',
        'entropy',
        'filter', 'find', 'sort', 'sortby',
        'reduce', 'some', 'every',
        'subarray', 'match',
        'replace', 'select', 'sel',
        'concat', 'cat', 'append', 'app', 'prepend',
        'remove', 'removeempty',
        'repeat', 'rep', 'fitrep', 'frep',
        'pad',
        'truncate',
        'block', 'b', 'group', 'g',
        'nest', 'unnest', 'un', 'unblock', 'ub', 'u', 'flatten',
        'ola', 'window', 'win',
        'copy', 'seg',
        'shift', 'mirror', 'mirr', 'mir',
        'reverse', 'rev',
        'invert', 'inv',
        'shuffle', 'randomize',
        'reorder', 'order',
        'queue', 'fifo',
        'round', 'floor', 'ceil', 'hwr', 'fwr', 'abs', 'modulo', 'mod',
        'mse', 'snr', 'dbsnr', 'diff', 'editdist',
        'dct', 'idct',
        'randomtrigger', 'randtrig',
        'unique', 'classify',
        'classify', 'stringify', 'tonumber', 'tonum', 'toFloat32',
        'morethan', 'mt', 'mtet', 'lessthan', 'lt', 'ltet',
        'split', 'join',
        'pitchquantize', 'pq', 'mtof', 'ftom',
        'ntob', 'bton', 'itob', 'btoi', 'btot', 'ttob',
        'size'
    ];

    var params = {
        name: '',
        type: null, // number, string, boolean, coll, mixed, date
        len: null,
        autolen: false,

        value: [],
        original: null,
        normalized: null,
        classes: null,
        numClasses: null,

        index: 0,
        step: 1,

        parent: null,

        hash: '',
        processed: 0
    };

    var array = function (fn) {
        if (isFunction(fn)) {
            fn(array);
            return array;
        } else {
            return array.clone.apply(this, arguments);
        }
    }; // this makes .name() not overridable?

    Object.defineProperty(array, 'name', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: ''
    });

    Object.defineProperty(array, 'length', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: 0
    });

    array.meta = {
        type: 'dtm.array',
        getParams: function () {
            return params;
        },
        addParams: function (paramsExt) {
            objForEach(paramsExt, function (val, key) {
                params[key] = val;
            });
            return array;
        },
        setOriginal: function (arr) {
            params.original = arr;
            return array;
        }
    };

    array.val = [];
    array.length = 0;
    array.undoStack = [];

    // TODO: list different query params in detail in the documentation
    /**
     * Returns the array contents or an analyzed value
     * @function module:array#get
     * @param [param] {string|number} If no argument is given, returns the array content. If given a number, returns the value at the index. If given a valid string, the value / stats / etc. is returned. Possible string keys are as follows: name|key, type, len|length, min|minimum, max|maximum, minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block|window (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram
     * @returns {number|array|string}
     */
    array.get = function (param) {
        if (isNumber(param)) {
            // TODO: support multiple single val arguments?
            if (!isInteger(param)) {
                param = Math.round(param)
            }

            return array.val[mod(param, array.length)];
        } else if (isArray(param) || isDtmArray(param)) {
            var indices = isDtmArray(param) ? param.get() : param;
            var res = [];

            // TODO: only accept integers

            indices.forEach(function (i) {
                if (isNumber(i)) {
                    if (!isInteger(i)) {
                        i = Math.round(i);
                    }
                    res.push(array.val[mod(i, array.length)]);
                } else if (isString(i) && isNestedDtmArray(array)) {
                    array.forEach(function (a) {
                        if (a.get('name') === i) {
                            res.push(a);
                        }
                    });
                }
            });

            if (isNestedDtmArray(array)) {
                res = dtm.array(res);
            } else if (isFloat32Array(array.val)) {
                res = toFloat32Array(res);
            }

            return res;

        } else if (isString(param)) {
            switch (param) {
                case 'getters':
                case 'help':
                case '?':
                    return 'name|key, type, len|length, min|minimum, max|maximum, extent|minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram'.split(', ');

                case 'methods':
                case 'functions':
                    return Object.keys(array);

                case 'name':
                case 'key':
                case 'label':
                    return params.name;

                case 'names':
                case 'keys':
                case 'labels':
                    if (isNestedWithDtmArray(array.val)) {
                        return array.val.map(function (a) {
                            return a.get('name');
                        });
                    } else {
                        return params.name;
                    }

                case 'type':
                    if (isNumArray(array.val)) {
                        return 'number';
                    } else if (isFloat32Array(array.val)) {
                        return 'Float32Array'
                    } else if (isStringArray(array.val)) {
                        return 'string';
                    } else if (isNestedWithDtmArray(array.val)) {
                        return 'nested';
                    } else {
                        return 'mixed';
                    }

                case 'parent':
                    return params.parent;

                case 'len':
                case 'length':
                    return array.length;

                case 'size':
                    if (isNestedDtmArray(array)) {
                        return { row: array.val[0].get('len'), col: array.length };
                    } else {
                        return array.length;
                    }

                case 'autolen':
                    return params.autolen;

                case 'hash':
                    return params.hash;

                case 'processed':
                    return params.processed;

                case 'nested':
                    return array.val.map(function (v) {
                        if (isDtmArray(v)) {
                            return v.get();
                        } else {
                            return v;
                        }
                    });

                case 'row':
                    if (isInteger(arguments[1]) && isNestedWithDtmArray(array.val)) {
                        var idx = arguments[1];
                        res = [];
                        array.val.forEach(function (a) {
                            res.push(a.get(idx));
                        });
                        if (isNumArray(res)) {
                            res = toFloat32Array(res);
                        }
                        return res;
                    } else {
                        break;
                    }

                /* STATS */
                case 'minimum':
                case 'min':
                    return getMin(array.val);

                case 'maximum':
                case 'max':
                    return getMax(array.val);

                case 'extent':
                case 'minmax':
                case 'range':
                    return [getMin(array.val), getMax(array.val)];

                case 'mean':
                case 'average':
                case 'avg':
                    return mean(array.val);

                case 'mode':
                    return mode(array.val);
                case 'median':
                    return median(array.val);
                case 'midrange':
                    return midrange(array.val);

                case 'standardDeviation':
                case 'std':
                    return std(array.val);
                case 'pstd':
                    return pstd(array.val);

                case 'variance':
                case 'var':
                    return variance(array.val);
                case 'populationVariance':
                case 'pvar':
                    return pvar(array.val);

                case 'sumAll':
                case 'sum':
                    return sum(array.val);

                case 'rms':
                    return rms(array.val);

                case 'pdf':
                    break;

                case 'entropy':
                    return array.clone().entropy().get();

                /* ITERATORS */
                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    return array.val[params.index];

                case 'next':
                    // TODO: increment after return
                    if (isEmpty(arguments[1])) {
                        params.index = mod(params.index + params.step, array.length);
                        return array.val[params.index];
                    } else if (isNumber(arguments[1]) && arguments[1] >= 1) {
                        // TODO: incr w/ the step size AFTER RETURN
                        params.index = mod(params.index + params.step, array.length);
                        blockArray = dtm.transform.getBlock(array.val, params.index, arguments[1]);
                        return dtm.array(blockArray);
                    } else {
                        return array;
                    }

                case 'prev':
                case 'previous':
                    params.index = mod(params.index - params.step, array.length);
                    return array.val[params.index];

                case 'palindrome':
                    break;

                case 'rand':
                case 'random':
                    params.index = randi(0, array.length);
                    return array.val[params.index];

                case 'urn':
                    break;

                case 'index':
                case 'idx':
                    return params.index;

                case 'hop':
                case 'hopSize':
                case 'step':
                case 'stepSize':
                    return params.step;

                case 'relative':
                case 'location':
                case 'loc':
                    break;

                case 'block':
                    var start, size, blockArray;
                    if (isArray(arguments[1])) {
                        start = arguments[1][0];
                        size = arguments[1][1];
                        blockArray = dtm.transform.getBlock(array.val, start, size);
                        return dtm.array(blockArray);
                    } else if (isNumber(arguments[1]) && isNumber(arguments[2])) {
                        start = arguments[1];
                        size = arguments[2];
                        blockArray = dtm.transform.getBlock(array.val, start, size);
                        return dtm.array(blockArray);
                    } else {
                        // CHECK: ???
                        return array.val;
                    }

                case 'blockNext':
                    // TODO: incr w/ the step size AFTER RETURN
                    params.index = mod(params.index + params.step, array.length);
                    blockArray = dtm.transform.getBlock(array.val, params.index, arguments[1]);
                    return dtm.array(blockArray);

                /* TRANSFORMED LIST */
                case 'original':
                    return params.original;
                    break;

                case 'normal':
                case 'normalize':
                case 'normalized':
                    if (isEmpty(params.normalized)) {
                        params.normalized = dtm.transform.normalize(array.val);
                    }
                    if (isInteger(arguments[1])) {
                        return params.normalized[mod(arguments[1], array.length)];
                    } else {
                        return params.normalized;
                    }

                case 'sorted':
                case 'sort':
                    return dtm.transform.sort(array.val);

                case 'uniques':
                case 'unique':
                case 'uniq':
                    return dtm.transform.unique(array.val);

                case 'classes':
                    return listClasses(array.val);

                case 'classID':
                case 'classId':
                    return dtm.transform.classId(array.val);

                case 'string':
                case 'stringify':
                    return dtm.transform.stringify(array.val);

                case 'numClasses':
                case 'numUniques':
                case 'numUniqs':
                    return listClasses(array.val).length;

                case 'unif':
                case 'uniformity':
                    return uniformity(array.val);

                case 'histogram':
                case 'histo':
                    return histo(array.val);

                // TODO: implement
                case 'distribution':
                case 'dist':
                    return [];

                default:
                    if (params.hasOwnProperty(param)) {
                        return params[param];
                    } else {
                        return array.val;
                    }
            }
        } else {
            //if (isNestedDtmArray(array)) {
            //    console.log(array.val.map(function (a) {
            //        return a.get();
            //    }));
            //    return array.val.map(function (a) {
            //        return a.get();
            //    });
            //} else {
            //    return array.val;
            //}
            return array.val;
        }
    };

    array.is = function (input) {
        if (isNumber(input)) {
            return array.get(0) === input;
        } else {
            return false;
        }
    };

    array.isnt = function (input) {
        if (isNumber(input)) {
            return array.get(0) !== input;
        } else {
            return false;
        }
    };
    /**
     * Returns an inner array specified by the index or the name. Note that this will always clone the array, so the further edit on the returned array will not affect the original array.
     * @function module:array:col
     * @param which
     * @returns {*}
     */
    array.col = function (which) {
        if (isNestedDtmArray(array)) {
            if (isString(which)) {
                var res;
                array.val.forEach(function (a) {
                    if (a.get('name') === which) {
                        res = a;
                    }
                });
                if (isEmpty(res)) {
                    res = array;
                }
                return res.clone();
            } else {
                return array.get(which).clone();
            }
        } else {
            return dtm.array(array.get(which)).label(array.get('name'));
        }
    };

    array.column = array.col;

    /**
     * Returns a row of a nested array by the index.
     * @param num
     * @returns {dtm.array}
     */
    array.row = function (num) {
        return array.set(array.get('row', num));
    };


    // memo: only for single-dimensional numerical interpolation
    // mode: linear, step (round), ...
    array.interp = function (at, mode) {
        if (!isString(mode)) {
            mode = 'linear';
        }

        var res = [];
        var indices = [];

        if (isNumber(at)) {
            indices[0] = at;
        } else if (isNumOrFloat32Array(at)) {
            indices = at;
        } else if (isNumDtmArray(at)) {
            indices = at.get();
        } else {
            return array;
        }

        indices.forEach(function (i) {
            if (mode === 'step' || mode === 'round') {
                res.push(array.val[mod(Math.round(i), array.length)]);
            } else {
                var floor = mod(Math.floor(i), array.length);
                var ceil = mod(floor + 1, array.length);
                var frac = i - Math.floor(i);

                res.push(array.val[floor] * (1-frac) + array.val[ceil] * frac);
            }
        });

        return array.set(res);
    };

    // interp with index scaled to the 0-1 range
    array.phase = function (at, mode) {
        if (!isString(mode)) {
            mode = 'linear';
        }

        var res = [];
        var indices = [];

        if (isNumber(at)) {
            indices[0] = at;
        } else if (isNumOrFloat32Array(at)) {
            indices = at;
        } else if (isNumDtmArray(at)) {
            indices = at.get();
        } else {
            return array;
        }

        indices.forEach(function (i) {
            // even number floor value gives positive direction
            // e.g., 0~1, 2~3, -1~-2
            // odd gives inverse direction
            if (mod(Math.floor(i), 2) === 0) {
                i = mod(i, 1);
            } else {
                i = 1 - mod(i, 1);
            }

            i *= (array.length-1); // rescale index range

            if (mode === 'step' || mode === 'round') {
                res.push(array.val[mod(Math.round(i), array.length)]);
            } else {
                var floor = mod(Math.floor(i), array.length);
                var ceil = mod(floor + 1, array.length);
                var frac = i - Math.floor(i);

                res.push(array.val[floor] * (1-frac) + array.val[ceil] * frac);
            }
        });

        return array.set(res);
    };

    // TODO: conflicts with gen.transpose()
    array.transp = function () {
        if (isNestedDtmArray(array)) {
            var newArray = [];
            var i = 0;
            while (array.val.some(function (a) {
                return i < a.get('len');
            })) {
                // TODO: get('row', i)
                newArray.push(array.get('row', i));
                i++;
            }
            return array.set(newArray);
        } else {
            return array.block(1);
        }
    };

    array.t = array.transp;

    /**
     * Sets or overwrites the contents of the array object.
     * @function module:array#set
     * @returns {dtm.array}
     */
    array.set = function () {
        if (arguments.length === 0) {
            return array;
        }

        if (argsAreSingleVals(arguments)) {
            var args = argsToArray(arguments);
            if (isNumArray(args)) {
                array.val = new Float32Array(args);
            } else {
                array.val = args;
            }
        } else {
            // if set arguments include any array-like object
            if (arguments.length === 1) {
                if (isNumber(arguments[0])) {
                    array.val = toFloat32Array(arguments[0]);
                } else if (isNumArray(arguments[0])) {
                    array.val = toFloat32Array(arguments[0]);
                } else if (isNestedArray(arguments[0])) {
                    array.val = new Array(arguments[0].length);
                    arguments[0].forEach(function (v, i) {
                        array.val[i] = dtm.array(v).parent(array);
                    });
                } else if (isNestedWithDtmArray(arguments[0])) {
                    array.val = arguments[0];
                    array.val.forEach(function (v) {
                        if (isDtmArray(v)) {
                            v.parent(array);
                        }
                    });
                } else if (isDtmArray(arguments[0])) {
                    // array.val = arguments[0].get(); // cloning
                    array = arguments[0]; // retain the reference
                    // set parent in the child
                } else if (isNestedDtmArray(arguments[0])) {
                    array.val = arguments[0].get();
                    array.val.forEach(function (v) {
                        v.parent(array);
                    });
                } else if (isString(arguments[0])) {
                    array.val = [arguments[0]]; // no splitting
                    checkType(array.val);
                } else {
                    array.val = arguments[0];
                }
            } else {
                array.val = new Array(arguments.length);

                argsForEach(arguments, function (v, i) {
                    if (isDtmArray(v)) {
                        array.val[i] = v;
                    } else {
                        array.val[i] = dtm.array(v);
                    }
                    array.val[i].parent(array);
                });
            }
        }

        if (isEmpty(params.original)) {
            params.original = array.val;

            // CHECK: type checking - may be redundant
            //checkType(array.val);
        } else {
            params.processed++;
        }

        array.length = array.val.length;
        params.index = array.length - 1;

        return array;
    };

    /**
     * Sets the name of the array object.
     * @function module:array#name
     * @param name {string}
     * @returns {dtm.array}
     */
    array.label = function (name) {
        if (isString(name)) {
            params.name = name;
        }
        return array;
    };

    array.name = array.label;

    array.keys = function () {
        if (isNestedDtmArray(array)) {
            return array.set(array.get('keys'));
        } else {
            return array;
        }
    };

    array.names = array.indices = array.keys;

    array.len = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (v) { return v.length; });
        } else {
            return array.set(array.length);
        }
    };

    /**
     * Sets the value type of the array content. Should be either 'number' or 'string'?
     * @function mudule:array#valuetype
     * @param arg
     * @returns {dtm.array}
     */
    array.valuetype = function (arg) {
        if (isString(arg)) {
            params.type = arg;
        }
        return array;
    };

    function generateHash(arr) {

    }

    function checkType(arr) {
        //var summed = sum(arr);
        //var res;
        //
        //if (isNaN(summed)) {
        //    res = 'string';
        //} else {
        //    if (summed.toString().indexOf('.') > -1) {
        //        res = 'float';
        //    } else {
        //        res = 'int';
        //    }
        //}

        // TODO: workaround for a missing value
        if (!isNumber(arr[0])) {
            if (isObject(arr[0])) {
                params.type = 'collection';
            } else {
                params.type = typeof(arr[0]);
            }
        } else {
            //params.type = 'number';
            params.type = typeof(arr[0]);
        }

        //array.type = res;
    }

    /**
     * Sets the size of the iteration step.
     * @function module:array#stepsize
     * @param val {number}
     * @returns {dtm.array}
     */
    array.stepsize = function (val) {
        if (isInteger(val) && val > 0) {
            params.step = val;
        }
        return array;
    };

    /**
     * Sets the current index within the array for the iterator. Value exceeding the max or min value will be wrapped around.
     * @function module:array#index
     * @param val {number}
     * @returns {dtm.array}
     */
    array.index = function (val) {
        if (isNumber(val)) {
            params.index = mod(Math.round(val), array.length);
        }
        return array;
    };

    /* GENERATORS */
    /**
     * Returns a copy of the array object. It can be used when you don't want to reference the same array object from different places. For convenience, you can also do arrObj() instead of arrObj.clone() to quickly return a copy.
     * @function module:array#clone
     * @returns {dtm.array}
     */
    array.clone = function () {
        if (arguments.length === 0) {
            var newValue = [];
            if (isNestedWithDtmArray(array.val)) {
                newValue = array.val.map(function (a) {
                    return a.clone();
                });
            } else {
                newValue = array.val;
            }
            var newArr = dtm.array(newValue).label(params.name);
            newArr.meta.setOriginal(params.original);

            // CHECK: this may cause troubles!
            newArr.index(params.index);
            newArr.stepsize(params.step);

            if (params.type === 'string') {
                newArr.classes = params.classes;
                //newArr.setType('string');
            }
            return newArr;
        } else {
            return array.col.apply(this, arguments)
        }
    };

    array.parent = function (obj) {
        if (isDtmArray(obj)) {
            params.parent = obj;
        }
        return array;
    };

    // TODO: array.block (and window) should transform the parent array into nested child array

    array.nest = function () {
        if (!isDtmArray(array.val)) {
            array.set([dtm.array(array.val)]);
            array.val[0].parent(array);
        }
        return array;
    };

    array.unnest = function () {
        if (isNestedDtmArray(array)) {
            var flattened = [];
            array.val.forEach(function (v) {
                if (isDtmArray(v)) {
                    flattened = concat(flattened, v.get());
                }
            });

            if (isNumArray(flattened)) {
                flattened = toFloat32Array(flattened);
            }
            return array.set(flattened);
        } else {
            return array;
        }
    };

    array.flatten = array.u = array.ungroup = array.ub = array.unblock = array.un = array.unnest;

    /**
     * Morphs the array values with a target array / dtm.array values. The lengths can be mismatched.
     * @function module:array#morph
     * @param tgtArr {array | dtm.array}
     * @param [morphIdx=0.5] {number} between 0-1
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.morph = function (tgtArr, morphIdx, interp) {
        if (isNumDtmArray(tgtArr)) {
            tgtArr = tgtArr.val;
        }

        // TODO: accept array for multi-point morphing
        if (isNumDtmArray(morphIdx)) {
            morphIdx = morphIdx.get(0);
        } else if (!isNumber(morphIdx)) {
            morphIdx = 0.5;
        }

        morphIdx = 1 - Math.abs(mod(morphIdx, 2) - 1);

        if (!isString(interp)) {
            interp = 'linear';
        }

        if (isNumDtmArray(array) && isNumOrFloat32Array(tgtArr)) {
            array.set(dtm.transform.morph(array.val, tgtArr, morphIdx, interp));
        }

        return array;
    };
    
    array.undo = function (steps) {
        if (!isNumber(steps) || steps < 1) {
            steps = 1;
        }
        return array;
    };

    array.redo = function (steps) {
        if (!isNumber(steps) || steps < 1) {
            steps = 1;
        }
        return array;
    };


    /**
     * Retrieves the original values from when the array object was first created.
     * @function module:array#reset
     * @returns {dtm.array}
     */
    array.reset = function () {
        return array.set(params.original);
    };

    /**
     * Overwrites the "original" state with the current state.
     * @returns {dtm.array}
     */
    array.save = function () {
        return array.meta.setOriginal(array.val);
    };

    array.residue = function () {
        return array.set(dtm.transform.subtract(params.original, array.val));
    };

    array.res = array.residue;

    /**
     * Clears all the contents of the array object.
     * @function module:array#flush | clear
     * @returns {dtm.array}
     */
    array.flush = function () {
        return array.set([]);
    };

    array.clear = array.flush;

    /* SCALARS */

    /**
     * Rescales the range of the numerical values to 0-1.
     * @function module:array#normalize
     * @param [arg1] {number} Prefered domain minimum value. If not present, the minimum of the input array is used.
     * @param [arg2] {number} Prefered domain maximum value. If not present, the maximum of the input array is used.
     * @returns {dtm.array}
     */
    array.normalize = function (arg1, arg2) {
        var min, max, args;

        if (isNestedDtmArray(array)) {
            if (isNumber(arg1) && isNumber(arg2)) {
                min = arg1;
                max = arg2;
            } else {
                min = Infinity;
                max = -Infinity;

                array.forEach(function (a) {
                    min = a.get('min') < min ? a.get('min') : min;
                    max = a.get('max') > max ? a.get('max') : max;
                });
            }

            return array.map(function (a) {
                return a.normalize(min, max);
            });
        }

        if (isNumber(arg1) && isNumber(arg2)) {
            min = arg1;
            max = arg2;
        } else {
            if (isNumOrFloat32Array(arg1)) {
                args = arg1;
            } else if (isDtmArray(arg1) && isNumOrFloat32Array(arg1.get())) {
                args = arg1.get();
            }

            if (isNumOrFloat32Array(args)) {
                if (args.length === 2) {
                    min = args[0];
                    max = args[1];
                } else if (args.length > 2) {
                    min = getMin(args);
                    max = getMax(args);
                }
            }
        }

        return array.set(dtm.transform.normalize(array.val, min, max));
    };

    array.n = array.normalize;

    /**
     * Modifies the range of the array. Shorthand: array.sc
     * @function module:array#range
     * @param arg1 {number|array|dtm.array} The target minimum value of the scaled range.
     * @param arg2 {number|array|dtm.array} The target maximum value of the scaled range.
     * @param [arg3] {number} The minimum of the domain (original) value.
     * @param [arg4] {number} The maximum of the domain value.
     * @returns {dtm.array}
     * @example
     * // Specifying the output range
     * dtm.array([1, 2, 3]).range([0, 10]).get();
     * // or
     * dtm.array([1, 2, 3]).range(0, 10).get();
     * -> [0, 5, 10]
     *
     * // Specifying the domain values (the second array in the argument)
     * dtm.array([1, 2, 3]).range([0, 10], [0, 5]).get();
     * // or
     * dtm.array([1, 2, 3]).range(0, 10, 0, 5).get();
     * -> [2, 4, 6]
     */
    array.range = function (arg1, arg2, arg3, arg4) {
        var min, max, dmin, dmax;

        if (isNestedDtmArray(array)) {
            if (isNumber(arg3) && isNumber(arg4)) {
                dmin = arg3;
                dmax = arg4;
            } else {
                dmin = Infinity;
                dmax = -Infinity;

                array.forEach(function (a) {
                    dmin = a.get('min') < dmin ? a.get('min') : dmin;
                    dmax = a.get('max') > dmax ? a.get('max') : dmax;
                });
            }

            return array.map(function (a) {
                return a.range(arg1, arg2, dmin, dmax);
            });
        }

        // TODO: better typecheck order

        if (arguments.length === 0) {
            min = 0;
            max = 1;
        } else if (isNumber(arg1)) {
            if (arguments.length === 1) {
                min = 0;
                max = arg1;
            } else {
                min = arg1;
            }
        } else if (isNumArray(arg1)) {
            if (arg1.length >= 2) {
                min = arg1[0];
                max = arg1[1];
            }
            if (arg1.length > 2) {
                min = getMin(arg1);
                max = getMax(arg1);
            }
        } else if (isDtmArray(arg1) && isNumOrFloat32Array(arg1.get())) {
            if (arg1.get('len') === 2) {
                min = arg1.get(0);
                max = arg1.get(1);
            } else if (arg1.get('len') > 2) {
                min = arg1.get('min');
                max = arg1.get('max');
            }
        } else {
            return array;
        }

        if (isNumber(arg2)) {
            max = arg2;
        } else if (isNumArray(arg2) && arg2.length === 2) {
            dmin = arg2[0];
            dmax = arg2[1];
        }

        if (isNumber(arg3)) {
            dmin = arg3;
        } else if (isNumArray(arg3) && arg3.length === 2) {
            dmin = arg3[0];
            dmax = arg3[1];
        }

        if (isNumber(arg4)) {
            dmax = arg4;
        }

        return array.set(dtm.transform.rescale(array.val, min, max, dmin, dmax));
    };

    array.r = array.range;

    array.unipolar = function () {
        return array.range(0, 1);
    };

    array.up = array.uni = array.unipolar;

    array.bipolar = function (dc) {
        if (!isBoolean(dc)) {
            dc = false;
        }

        // TODO: this is wrong
        if (dc) {
            var mean = array.get('mean');
            var posSize = array.get('max') - mean;
            var negSize = mean - array.get('min');

            if (posSize >= negSize) {
                return array.range(-1, 1, mean - posSize, array.get('max'));
            } else {
                return array.range(-1, 1, array.get('min'), mean + negSize);
            }
        } else {
            return array.range(-1, 1);
        }
    };

    array.bp = array.bi = array.bipolar;

    // array.amp = function () {
    //     return array;
    // };

    // with support for fractional freq array with table lookup and angular velocity
    array.freq = function (input) {
        var freqArr;

        if (argsAreSingleVals(arguments)) {
            freqArr = argsToArray(arguments);
        } else if (isNumOrFloat32Array(input)) {
            freqArr = input;
        } else if (isNumDtmArray(input)) {
            freqArr = input.get();
        }

        var res = [];

        var phase = 0;
        var len;
        var wavetable = array.clone();

        if (freqArr.length > array.length) {
            wavetable.fit(freqArr.length, 'step');
            len = freqArr.length;
        } else {
            len = wavetable.length;
        }

        var currFreqVal = 1;
        var floor, ceil, frac;

        dtm.line(len).forEach(function (p) {
            currFreqVal = freqArr[Math.floor(p * freqArr.length)];
            if (currFreqVal < 0) {
                phase += 1/len * currFreqVal;
                phase = mod(phase, 1);
            }

            floor = Math.floor(phase * (len-1));
            ceil = floor + 1;
            // ceil = currFreqVal >= 0 ? floor + 1 : floor - 1;
            // ceil = mod(ceil, len);
            frac = phase * (len-1) - floor;

            res.push(wavetable.val[floor] * (1-frac) + wavetable.val[ceil] * frac);

            if (currFreqVal >= 0) {
                phase += 1/len * currFreqVal;
                phase = mod(phase, 1);
            }
        });

        return array.set(res);
    };

    /**
     * Caps the array value range at the min and max values. Only works with a numerical array.
     * @function module:array#limit | clip
     * @param [min=0]
     * @param [max=1]
     * @returns {dtm.array}
     */
    array.limit = function (min, max) {
        if (isNumOrFloat32Array(array.val)) {
            min = min || 0;
            max = max || 1;
            return array.set(dtm.transform.limit(array.get(), min, max));
        } else {
            return array;
        }
    };

    array.clip = array.limit;

    /**
     * Scales the array with an exponential curve.
     * @function module:array#expcurve
     * @param factor {number}
     * @param [min=array.get('min')] {number}
     * @param [max=array.get('max')] {number}
     * @returns {dtm.array}
     */
    array.expcurve = function (factor, min, max) {
        if (isEmpty(min)) {
            min = array.get('min');
        }
        if (isEmpty(max)) {
            max = array.get('max');
        }

        var arr = dtm.transform.expCurve(array.get('normalized'), factor);
        return array.set(dtm.transform.rescale(arr, min, max));
    };

    array.expc = array.expcurve;

    /**
     * Applies a logarithmic scaling to the array.
     * @function module:array#logc | logcurve
     * @param factor {number}
     * @param [min=array.get('min')] {number}
     * @param [max=array.get('max')] {number}
     * @returns {dtm.array}
     */
    array.logcurve = function (factor, min, max) {
        if (isEmpty(min)) {
            min = array.get('min');
        }
        if (isEmpty(max)) {
            max = array.get('max');
        }

        var arr = dtm.transform.logCurve(array.get('normalized'), factor);
        return array.set(dtm.transform.rescale(arr, min, max));
    };

    array.logc = array.logcurve;

    // TODO: design & implement
    /**
     * Log curve and exp curve combined
     * @param factor
     * @param [min]
     * @param [max]
     */
    array.curve = function (factor, min, max) {
        return array;
    };

    /**
     * Stretches or shrinks the length of the array into the specified length.
     * @function module:array#fit
     * @param len {number} Integer
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.fit = function (len, interp) {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.fit(len, interp);
            });
        }

        return array.set(dtm.transform.fit(array.val, len, interp));
    };

    array.f = array.fit;

    array.line = function (len) {
        return array.fit(len, 'linear');
    };

    array.linear = array.line;

    array.step = function (len) {
        return array.fit(len, 'step');
    };

    array.cubic = function (len) {
        return array.fit(len, 'cubic');
    };

    array.cos = function (len) {
        return array.fit(len, 'cos');
    };

    array.fit.line = array.line;
    array.fit.linear = array.line;
    array.fit.step = array.step;
    array.fit.cubic = array.cubic;
    array.fit.cos = array.cos;

    /**
     * Multiplies the length of the array by the given factor.
     * @function module:array#stretch
     * @param factor {number}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.stretch = function (factor, interp) {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.stretch(factor, interp);
            })
        }

        return array.set(dtm.transform.stretch(array.val, factor, interp));
    };

    array.ts = array.s = array.str = array.stretch;

    array.stretch.line = function (factor) {
        return array.stretch(factor, 'linear');
    };

    array.stretch.linear = array.stretch.line;

    array.stretch.step = function (factor) {
        return array.stretch(factor, 'step');
    };

    array.stretch.cubic = function (factor) {
        return array.stretch(factor, 'cubic');
    };

    array.stretch.cos = function (factor) {
        return array.stretch(factor, 'cos');
    };

    /**
     * Adds a value to all the array elements.
     * @function module:array#add
     * @param factor {number|array|dtm.array}
     * @param [interp='step'] {string}
     * @returns {dtm.array}
     * @example
     * <div> hey </div>
     */
    array.add = function (factor, interp) {
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.add(factor.get('next'));
                } else {
                    return a.add(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(array.get());
                });
                array.set(newArr);
                return array.map(function (a) {
                    return a.add(factor.get('next'));
                });
            }

            return array.set(dtm.transform.add(array.val, factor, interp));
        }
    };

    array.subtract = function (factor, interp) {
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.add(factor.get('next'));
                } else {
                    return a.add(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(array.get());
                });
                array.set(newArr);
                return array.map(function (a) {
                    return a.add(factor.get('next'));
                });
            }

            return array.set(dtm.transform.subtract(array.val, factor, interp));
        }
    };

    /**
     * Scales the numerical array contents.
     * @function module:array#mult
     * @param factor {number|array|dtm.array}
     * @param [interp='step'] {string}
     * @returns {dtm.array}
     */
    array.mult = function (factor, interp) {
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.mult(factor.get('next'));
                } else {
                    return a.mult(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(array.get());
                });
                array.set(newArr);
                return array.map(function (a) {
                    return a.mult(factor.get('next'));
                });
            }

            return array.set(dtm.transform.mult(array.val, factor, interp));
        }
    };

    array.dot = array.mult;

    array.amp = function (input) {
        var ampArr;

        if (argsAreSingleVals(arguments)) {
            ampArr = argsToArray(arguments);
        } else if (isNumOrFloat32Array(input)) {
            ampArr = input;
        } else if (isNumDtmArray(input)) {
            ampArr = input.get();
        }

        return array.mult(ampArr);
    };

    array.gain = array.amp;

    array.divide = function (factor, interp) {
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.divide(factor.get('next'));
                } else {
                    return a.divide(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(array.get());
                });
                array.set(newArr);
                return array.map(function (a) {
                    return a.divide(factor.get('next'));
                });
            }

            return array.set(dtm.transform.div(array.val, factor, interp));
        }
    };

    array.div = array.divide;

    array.reciprocal = function () {
        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                return a.reciprocal();
            });
        } else if (isNumDtmArray(array)) {
            return array.map(function (v) {
                return 1/v;
            });
        } else {
            return array;
        }
    };

    array.recip = array.reciprocal;

    /**
     * @function module:array#pow
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.pow = function (factor, interp) {
        if (isNumDtmArray(factor)) {
            factor = factor.get();
        }
        return array.set(dtm.transform.pow(array.val, factor, interp));
    };

    /**
     * Applys the array contents as the power to the argument as the base
     * @function module:array#powof
     * @param factor {number|array|dtm.array}
     * @param [interp='linear'] {string}
     * @returns {dtm.array}
     */
    array.powof = function (factor, interp) {
        if (isNumDtmArray(factor)) {
            factor = factor.get();
        }
        return array.set(dtm.transform.powof(array.val, factor, interp));
    };

    array.log = function (base, interp) {
        if (isNumDtmArray(base)) {
            base = base.get();
        }
        return array.set(dtm.transform.log(array.val, base, interp));
    };

    /* CONVERSION WITH STATS */
    array.min = function (fn) {
        if (isFunction(fn)) {
            var res = getMin(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.min();
                });
            } else {
                return array.set(getMin(array.val));
            }
        }
    };

    array.max = function (fn) {
        if (isFunction(fn)) {
            var res = getMax(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.max();
                });
            } else {
                return array.set(getMax(array.val));
            }
        }
    };

    array.extent = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.set(a.get('extent'));
            });
        } else {
            return array.set(array.get('extent'));
        }
    };

    array.mean = function (fn) {
        if (isFunction(fn)) {
            var res = mean(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.mean();
                });
            } else {
                return array.set(mean(array.val));
            }
        }
    };

    array.avg = array.mean;

    array.mode = function (fn) {
        if (isFunction(fn)) {
            var res = mode(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.mode();
                });
            } else {
                return array.set(mode(array.val));
            }
        }
    };

    array.median = function (fn) {
        if (isFunction(fn)) {
            var res = median(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.median();
                });
            } else {
                return array.set(median(array.val));
            }
        }
    };

    array.midrange = function (fn) {
        if (isFunction(fn)) {
            var res = midrange(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.midrange();
                });
            } else {
                return array.set(midrange(array.val));
            }
        }
    };

    array.mid = array.midrange;

    array.std = function (fn) {
        if (isFunction(fn)) {
            var res = std(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.std();
                });
            } else {
                return array.set(std(array.val));
            }
        }
    };

    array.pstd = function (fn) {
        if (isFunction(fn)) {
            var res = pstd(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.pstd();
                });
            } else {
                return array.set(pstd(array.val));
            }
        }
    };

    array.var = function (fn) {
        if (isFunction(fn)) {
            var res = variance(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.var();
                });
            } else {
                return array.set(variance(array.val));
            }
        }
    };

    array.pvar = function (fn) {
        if (isFunction(fn)) {
            var res = pvar(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.pvar();
                });
            } else {
                return array.set(pvar(array.val));
            }
        }
    };

    array.rms = function (fn) {
        if (isFunction(fn)) {
            var res = rms(array.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(array)) {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return array.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(array)) {
                return array.map(function (a) {
                    return a.rms();
                });
            } else {
                return array.set(rms(array.val));
            }
        }
    };

    array.linreg = function () {
        if (isNumDtmArray(array)) {
            var xEst = dtm.range(array.get('len')).get('mean');
            var yEst = array.get('mean');
            var SSxy = 0;
            var SSxx = 0;

            array.val.forEach(function (y, x) {
                SSxy += (x - xEst) * (y - yEst);
                SSxx += Math.pow((x - xEst), 2);
            });
            var b1 = SSxy / SSxx;
            var b0 = yEst - b1 * xEst;

            var est = [];
            var err = [];
            for (var i = 0; i < array.get('len'); i++) {
                est.push(b0 + b1 * i);
                err.push(array.get(i) - est[i]);
            }

            return array.set([est, err, [b1, b0]]);
        } else if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.linreg();
            });
        } else {
            return array;
        }
    };

    array.polyreg = function (n) {
        return array;
    };

    array.covar = function (tgt) {
        if (isNumDtmArray(array)) {
            if (isNumDtmArray(tgt)) {
                tgt = tgt.clone();
            } else if (isNumOrFloat32Array(tgt)) {
                tgt = dtm.array(tgt);
            } else {
                tgt = array.clone();
            }

            var len = array.get('len');

            if (tgt.get('len') !== len) {
                tgt.fit(len, 'step');
            }

            var xEst = array.get('mean');
            var yEst = array.get('mean');

            var res = 0;

            for (var i = 0; i < len; i++) {
                res += (array.get(i) - xEst) * (tgt.get(i) - yEst);
            }

            res /= len;

            return dtm.array(res);
        } else {
            return array;
        }
    };

    array.cov = array.covar;

    array.conv = function (tgt) {
        return array;
    };

    array.corr = function (tgt) {
        if (isNumDtmArray(array)) {
            var res = dtm.array();
            var zeros = dtm.const(0).size(array.get('len'));
            var src = array();

            if (isNumDtmArray(tgt) || isNumOrFloat32Array(tgt)) {
                var tgtLen = isNumOrFloat32Array(tgt) ? tgt.length : tgt.get('len');
                tgt = zeros().append(tgt).append(zeros);
                src.append(dtm.const(0).size(tgtLen)).append(zeros);
            } else {
                tgt = zeros().append(src).append(zeros);
                src.append(zeros).append(zeros);
            }

            for (var i = 0; i < src.get('len') - (array.get('len')-1); i++) {
                res.append(src().mult(tgt).get('sum'));
                src.shift(-1);
            }

            return res;
        } else {
            return array;
        }
    };

    array.corrcoef = function (tgt) {
        if (isNumDtmArray(array)) {

        } else {
            return array;
        }
    };

    array.amdf = function (max) {
        if (!isNumber(max)) {
            max = Math.round(array.length / 2);
        }

        var res = [];

        for (var i = 1; i < max; i++) {
            res.push(array().subtract(array().shift(i)).abs().mean().get(0));
        }

        return array.set(res);
    };

    // TODO: not consistent with other stats-based conversions
    array.sum = function () {
        if (isNestedWithDtmArray(array.val)) {
            var maxLen = 0;
            array.val.forEach(function (a) {
                if (a.get('len') > maxLen) {
                    maxLen = a.get('len');
                }
            });

            var res = new Float32Array(maxLen);

            for (var i = 0; i < maxLen; i++) {
                array.val.forEach(function (a) {
                    if (i < a.get('len') && isNumber(a.get(i))) {
                        res[i] += a.get(i);
                    }
                });
            }

            return array.set(res);
        } else {
            var sum = array.val.reduce(function (a, b) {
                return a + b;
            });
            return array.set(sum);
        }
    };

    array.sumrow = function () {
        return array;
    };

    /**
     * Scales the values so that the sum fits the target value. Useful, for example, for fitting intervallic values to a specific measure length.
     * @function module:array#fitsum
     * @param tgt {number} If the round argument is true, the target value is also rounded.
     * @param [round=false] {boolean}
     * @returns {dtm.array}
     */
    array.fitsum = function (tgt, round, min) {
        return array.set(dtm.transform.fitSum(array.val, tgt, round));
    };

    array.prod = function () {

    };

    /* LIST OPERATIONS*/

    // TODO: support for the optional 'this' argument (see the JS Array documentation)
    /**
     * Performs JS Array.map function to the array values.
     * @function module:array#map
     * @param fn
     * @returns {dtm.array}
     */
    array.map = function (fn) {
        //return array.set(array.val.map(callback));
        return array.set(fromFloat32Array(array.val).map(fn));
    };

    array.map.dist = function () {
        if (!isNestedDtmArray(array)) {
            var dist = array().pmf();
            return array.map(function (v) {
                return dist().col(v.toString()).get(0);
            });
        } else {
            return array;
        }
    };

    array.map.entropy = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.entropy();
            });
        } else {
            return array.entropy();
        }
    };

    array.map.histo = function () {
        // CHECK: this is hacky
        params.type = 'string'; // re-set the type to string from number
        return array.set(toFloat32Array(histo(array.val)));
    };

    array.foreach = function (fn) {
        array.val.forEach(fn);
        return array;
    };

    array.forEach = array.foreach;

    array.each = function (fn) {
        // if (isNestedDtmArray(array)) {
        //     array.forEach(fn);
        // } else {
        //     array.forEach(fn);
        // }
        return array.forEach(fn);
    };

    // TODO: use prototype
    // fnList.forEach(function (v) {
    //     array.each[v] = function () {
    //         var self = this;
    //         var args = arguments;
    //
    //         if (isNestedDtmArray(array)) {
    //             array.forEach(function (a) {
    //                 a[v].apply(self, args);
    //             });
    //             return array;
    //         } else {
    //             return array;
    //         }
    //     };
    //
    //     array.map[v] = function () {
    //         var self = this;
    //         var args = arguments;
    //
    //         if (isNestedDtmArray(array)) {
    //             return array.map(function (a) {
    //                 return a[v].apply(self, args);
    //             });
    //         } else {
    //             return array;
    //         }
    //     };
    // });

    array.filter = function (fn) {
        return array.set(array.val.filter(fn));
    };

    array.find = function (tgt) {
        if (!isEmpty(tgt)) {
            var res = [];

            if (isFunction(tgt)) {
                array.forEach(function (v, i) {
                    if (tgt(v)) {
                        res.push(i);
                    }
                });
            } else if (isSingleVal(tgt)) {
                array.forEach(function (v, i) {
                    if (v === tgt) {
                        res.push(i);
                    }
                });
            } else {
                return array;
            }

            return array.set(res);
        } else {
            return array;
        }
    };

    /**
     * Sorts the contents of numerical array.
     * @function module:array#sort
     * @returns {dtm.array}
     */
    array.sort = function (fn) {
        if (isEmpty(fn)) {
            return array.set(dtm.transform.sort(array.val));
        } else {
            return array.set(array.val.sort(fn));
        }
    };

    array.sortby = function (fn, desc) {
        if (!isBoolean(desc)) {
            desc = false;
        }
        if (!isFunction(fn)) {
            fn = function (v) {
                return v;
            };
        }
        var res = array.val.sort(function (a, b) {
            if (desc) {
                return fn(b) - fn(a);
            } else {
                return fn(a) - fn(b);
            }
        });
        return array.set(res);
    };

    array.sort.by = array.sortby;

    array.reduce = function (fn) {
        return array.set(array.val.reduce(fn));
    };

    // TODO: these should be in the get method
    array.some = function (fn) {
        return array.val.some(fn);
    };

    array.every = function (fn) {
        return array.val.every(fn);
    };

    array.subarray = function () {
        return array;
    };

    // TODO: regexp-like processing???
    array.match = function () {
        return array;
    };

    array.pick = function () {
        return array;
    };

    array.replace = function (tgt, val) {
        // TODO: type and length check
        // TODO: if val is an array-ish, fill the tgt w/ the array elements
        if (isSingleVal(val)) {
            if (isSingleVal(tgt)) {
                return array.set(array.val.map(function (v) {
                    if (v === tgt) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isArray(tgt)) {
                return array.set(array.val.map(function (v) {
                    if (tgt.some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isDtmArray(tgt)) {
                return array.set(array.val.map(function (v) {
                    if (tgt.get().some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isFunction(tgt)) {
                return array.set(array.val.map(function (v) {
                    if (tgt(v)) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            }
        } else {
            return array;
        }
    };

    // TODO: impelemnt
    array.replaceat = function (idx, val) {
        return array;
    };

    // TODO: support typed array
    array.select = function () {
        var indices, res = [];
        if (argsAreSingleVals(arguments)) {
            indices = argsToArray(arguments);
        } else if (isNumOrFloat32Array(arguments[0])) {
            indices = arguments[0];
        } else if (isDtmArray(arguments[0]) && isNumOrFloat32Array(arguments[0].get())) {
            indices = arguments[0].get();
        }

        if (!isNumOrFloat32Array(indices)) {
            return array;
        } else {
            indices.forEach(function (i) {
                res.push(array.val[mod(i, array.length)]);
            });
            return array.set(res);
        }
    };

    array.sel = array.select;

    // TODO: nested array and concat?
    /**
     * Concatenates new values to the contents.
     * @function module:array#concat | append
     * @param arr {array | dtm.array} A regular array or a dtm.array object.
     * @returns {dtm.array}
     */
    array.concat = function (arr) {
        if (isEmpty(arr)) {
            arr = [];
        }

        if (isDtmArray(arr)) {
            array.val = concat(array.val, arr.get());
        } else {
            array.val = concat(array.val, arr);
        }
        return array.set(array.val);
    };

    array.app = array.append = array.cat = array.concat;

    array.prepend = function (arr) {
        if (isEmpty(arr)) {
            arr = [];
        }

        if (isDtmArray(arr)) {
            array.val = concat(arr.get(), array.val);
        } else {
            array.val = concat(arr, array.val);
        }
        return array.set(array.val);
    };

    /**
     * Repeats the contents of the current array.
     * @function module:array#repeat | rep
     * @param count {number} Integer
     * @returns {dtm.array}
     */
    array.repeat = function (count) {
        if (isDtmArray(count) && count.get('len') === 1) {
            count = count.get(0);
        }

        if (!isInteger(count)) {
            count = 1;
        }

        return array.set(dtm.transform.repeat(array.val, count));
    };

    array.rep = array.repeat;

    array.fitrep = function (count, interp) {
        if (isDtmArray(count) && count.get('len') === 1) {
            count = count.get(0);
        }

        if (!isInteger(count)) {
            count = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        return array.set(dtm.transform.fit(dtm.transform.repeat(array.val, count), array.length, interp));
    };

    array.frep = array.fitrep;

    /**
     * @function module:array#pad
     * @param val
     * @param length
     * @returns {{type: string}}
     */
    array.pad = function (val, length) {
        var test = [];
        for (var i = 0; i < length; i++) {
            test.push(val);
        }

        return array.concat(test);
    };

    /**
     * Truncates some values either at the end or both at the beginning and the end.
     * @function module:array#truncate
     * @param arg1 {number} Start bits to truncate. If the arg2 is not present, it will be the end bits to truncate.
     * @param [arg2] {number} End bits to truncate.
     * @returns {dtm.array}
     */
    array.truncate = function (arg1, arg2) {
        return array.set(dtm.transform.truncate(array.val, arg1, arg2));
    };

    array.remove = function (input) {
        var at = [];
        var val = array.val;

        if (argsAreSingleVals(arguments)) {
            if (isNumArray(argsToArray(arguments))) {
                at = argsToArray(arguments);
            }
        } else if (isNumOrFloat32Array(input)) {
            at = input;
        } else if (isNumDtmArray(input)) {
            at = input.get();
        }

        at.forEach(function (i) {
            val.splice(i, 1);
        });
        return array.set(val);
    };

    array.remove.at = function (input) {
        var at = [];
        var val = array.val;

        if (argsAreSingleVals(arguments)) {
            if (isNumArray(argsToArray(arguments))) {
                at = argsToArray(arguments);
            }
        } else if (isNumOrFloat32Array(input)) {
            at = input;
        } else if (isNumDtmArray(input)) {
            at = input.get();
        }

        at.forEach(function (i) {
            val = splice(val, Math.round(i), 1);
        });
        return array.set(val);
    };

    // TODO: accept option as arg? for numBlocks, pad, overlap ratio, etc.
    array.block = function (len, hop, window, pad) {
        if (!isInteger(len) || len < 1) {
            len = 1;
        } else if (len > array.length) {
            len = array.length;
        }
        if (!isInteger(hop) || hop < 1) {
            hop = len;
        }
        if (isEmpty(window)) {
            window = 'rectangular';
        }

        var newArr = [];
        var numBlocks = Math.floor((array.length - len) / hop) + 1;

        for (var i = 0; i < numBlocks; i++) {
            // name: original starting index
            newArr[i] = dtm.array(array.val.slice(i*hop, i*hop+len)).window(window).parent(array).label((i*hop).toString());
        }

        return array.set(newArr);
    };

    array.g = array.group = array.b = array.bl = array.block;

    array.block.at = function () {
        return array;
    };

    array.block.diff = function (val, abs) {
        if (!isBoolean(abs)) {
            abs = false;
        }



        return array;
    };

    array.block.into = function (val) {
        if (isInteger(val)) {
            var len = Math.floor(array.length / val);
            return array.block(len);
        } else {
            return array;
        }
    };

    array.block.peak = function (tolerance) {
        return array;
    };

    array.block.minpeak = function (tolerance) {
        return array;
    };

    array.ola = function (hop) {
        if (!isInteger(hop) || hop < 1) {
            hop = 1;
        }

        if (isNestedWithDtmArray(array.val)) {
            var len = hop * (array.length-1) + array.val[0].get('len');
            var newArr = new Array(len);
            newArr.fill(0);
            array.val.forEach(function (a, i) {
                a.foreach(function (v, j) {
                    newArr[i*hop+j] += v;
                });
            });

            return array.set(newArr);
        } else {
            return array;
        }
    };

    /**
     * Applies a window function to the array. May be combined with array.block() operation.
     * @function module:array#window
     * @param type
     * @returns {dtm.array}
     */
    array.window = function (type) {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.window(type);
            });
        } else {
            return array.set(dtm.transform.window(array.val, type));
        }
    };

    array.win = array.window;

    array.copy = function (times) {
        if (!isInteger(times)) {
            times = 1;
        }
        if (!isNestedDtmArray(array)) {
            var res = [];
            for (var i = 0; i < times; i++) {
                res.push(array.val);
            }
            return dtm.array(res);
        } else {

        }
        return array;
    };

    array.seg = function (idx) {
        if (isNumArray(idx) || isNumDtmArray(idx)) {
            var res = [];
            var len = idx.length;
            if (isNumDtmArray(idx)) {
                idx = idx.get();
            }

            if (idx[0] !== 0) {
                if (isFloat32Array(array.val)) {
                    res.push(dtm.array(array.val.subarray(0, idx[0])).label('0'));
                } else {
                    res.push(dtm.array(array.val.slice(0, idx[0])).label('0'));
                }
            }

            for (var i = 0; i < len-1; i++) {
                if (isFloat32Array(array.val)) {
                    res.push(dtm.array(array.val.subarray(idx[i], idx[i+1])).label(idx[i].toString()));
                } else {
                    res.push(dtm.array(array.val.slice(idx[i], idx[i+1])).label(idx[i].toString()));
                }
            }

            if (isFloat32Array(array.val)) {
                res.push(dtm.array(array.val.subarray(idx[i], array.val.length)).label(idx[i].toString()));
            } else {
                res.push(dtm.array(array.val.slice(idx[i], array.val.length)).label(idx[i].toString()));
            }

            return array.set(res);
        } else if (isInteger(idx)) {
            return array;
        }

        return array;
    };

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:array#shift
     * @param amount {number} Integer
     * @returns {dtm.array}
     */
    array.shift = function (amount) {
        return array.set(dtm.transform.shift(array.val, amount));
    };

    /**
     * Appends an reversed array at the tail.
     * @function module:array#mirror
     * @returns {{type: string}}
     */
    array.mirror = function () {
        return array.concat(dtm.transform.reverse(array.val));
    };

    array.mir = array.mirr = array.mirror;

    /**
     * Flips the array contents horizontally.
     * @function module:array#reverse | rev
     * @returns {dtm.array}
     */
    array.reverse = function () {
        return array.set(dtm.transform.reverse(array.val));
    };

    array.rev = array.reverse;

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:array#invert | inv | flip
     * @param [center=meanVal] {number}
     * @returns {dtm.array}
     */
    array.invert = function (center) {
        return array.set(dtm.transform.invert(array.val, center));
    };

    /**
     * Same as array.invert().
     * @function module:array#inv
     * @type {Function}
     */
    array.inv =  array.invert;

    /**
     * Randomizes the order of the array.
     * @function module:array#shuffle | random | randomize | rand
     * @returns {dtm.array}
     */
    array.shuffle = function () {
        return array.set(dtm.transform.shuffle(array.val));
    };

    array.randomize = array.shuffle;

    array.reorder = function () {
        var indices;

        if (isDtmArray(arguments[0])) {
            indices = toFloat32Array(arguments[0]);
        } else if (argsAreSingleVals(arguments)) {
            indices = argsToArray(arguments);
        } else if (argIsSingleArray(arguments)) {
            indices = arguments[0];
        }

        if (isNumOrFloat32Array(indices)) {
            var newArr = new Array(indices.length);
            indices.forEach(function (v, i) {
                newArr[i] = array.get(v);
            });
        }
        return array.set(newArr);
    };

    array.order = array.reorder;

    /**
     * Adds new value(s) at the end of the array, and removes the oldest value(s) at the beginning of the array. The size of the array is unchanged.
     * @function module:array#queue | fifo
     * @param input {number|array}
     * @returns {dtm.array}
     */
    array.queue = function (input) {
        if (isNumber(input)) {
            array.val.push(input);
            array.val.shift();
        } else if (isFloat32Array(input)) {
            array.val = Float32Concat(array.val, input);
            array.val = array.val.splice(input.length);
        } else if (isArray(input)) {
            if (isFloat32Array(array.val)) {
                array.val = Float32Concat(array.val, input);
                array.val = Float32Splice(array.val, 0, input.length);
            } else {
                array.val = array.val.concat(input);
                array.val = array.val.splice(input.length);
            }
        } else if (isDtmArray(input)) {
            array.val = array.val.concat(input.get());
            array.val = array.val.splice(input.get('len'));
        }
        return array.set(array.val);
    };

    array.fifo = array.queue;

    /* ARITHMETIC */

    /**
     * Rounds float values of the array to integer values.
     * @function module:array#round
     * @param to {number}
     * @returns {dtm.array}
     */
    array.round = function (to) {
        return array.set(dtm.transform.round(array.val, to));
    };

    /**
     * Quantizes float numbers to integer by flooring.
     * @function module:array#floor
     * @returns {dtm.array}
     */
    array.floor = function () {
        return array.set(dtm.transform.floor(array.val));
    };

    /**
     * Quantizes float numbers to integer by ceiling.
     * @function module:array#ceil
     * @returns {dtm.array}
     */
    array.ceil = function () {
        return array.set(dtm.transform.ceil(array.val));
    };

    /**
     * Half-wave rectify the values, modifying all negative values to 0.
     * @function module:array#hwr
     * @returns {dtm.array}
     */
    array.hwr = function () {
        return array.set(dtm.transform.hwr(array.val));
    };

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:array#fwr | abs
     * @returns {dtm.array}
     */
    array.fwr = function () {
        return array.set(dtm.transform.fwr(array.val));
    };

    array.abs = array.fwr;

    array.modulo = function (divisor) {
        return array.set(dtm.transform.mod(array.val, divisor));
    };

    array.mod = array.modulo;

    /**
     * Calculates the mean-square-error. If no argument is given, it will take the current array state as the modified value, and calculates the distortion from the original (initial state) value of itself. This would be useful for choosing quantization or transformation methods with less distortion to the data.
     * @returns {dtm.array}
     */
    array.mse = function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(array)) {
                var source = array.clone().reset();

                // respect the original length
                if (source.get('len') !== array.get('len')) {
                    array.fit(source.get('len'), 'step');
                }

                return source().subtract(array).pow(2).sum().divide(source.get('len'));
            }
        } else {
            return array;
        }
    };

    array.snr = function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(array)) {
                var mse = array.clone().mse();
                return array.set(meanSquare(array.val) / mse.get(0));
            }
        }
        return array;
    };

    array.dbsnr = function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(array)) {
                var snr = array.snr();
                return array.set(10 * Math.log10(snr.get(0)));
            }
        }
        return array;
    };

    /**
     * @function module:array#diff
     * @returns {dtm.array}
     */
    array.diff = function (order, pad) {
        if (!isInteger(order) || order < 1) {
            order = 1;
        }
        for (var i = 0; i < order; i++) {
            array.val = dtm.transform.diff(array.val);
        }

        if (isSingleVal(pad)) {
            for (var i = 0; i < order; i++) {
                array.val = concat(array.val, pad);
            }
        }
        return array.set(array.val);
    };

    array.editdist = function (target) {
        if (isString(target)) {
            return array.set(dtm.transform.editDistance(array.val, target));
        } else {
            return array;
        }
    };

    // /**
    //  * Removes zeros from the sequence.
    //  * @function module:array#removezeros
    //  * @returns {dtm.array}
    //  */
    // array.removezeros = function () {
    //     return array.set(dtm.transform.removeZeros(array.val));
    // };
    //
    // array.removevalue = function () {
    //     return array;
    // };

    array.dct = function () {
        if (isNumDtmArray(array)) {
            var res = [];
            var w;
            for (var k = 0; k < array.length; k++) {
                if (k === 0) {
                    w = Math.sqrt(1/(4*array.length));
                } else {
                    w = Math.sqrt(1/(2*array.length));
                }
                res.push(2 * w * sum(array.val.map(function (v, n) {
                    return v * Math.cos(Math.PI/array.length * (n + 0.5) * k);
                })));
            }
            return array.set(res);
        } else if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.dct();
            });
        }
        return array;
    };

    array.idct = function () {
        if (isNumDtmArray(array)) {
            var res = [];
            for (var k = 0; k < array.length; k++) {
                res.push(sum(array.val.map(function (v, n) {
                    if (n === 0) {
                        return v / Math.sqrt(array.length);
                    } else {
                        return Math.sqrt(2/array.length) * v * Math.cos(Math.PI/array.length * n * (k + 0.5));
                    }
                })));
            }
            return array.set(res);
        } else if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.idct();
            });
        }
        return array;
    };

    array.fir = function (coef) {
        var coef_ = [];
        if (argsAreSingleVals(arguments)) {
            coef_ = argsToArray(arguments);
        } else if (isNumOrFloat32Array(coef)) {
            coef_ = coef;
        } else if (isNumDtmArray(coef)) {
            coef_ = coef.get();
        }
        var res = [];

        for (var n = 0; n < array.length; n++) {
            res[n] = 0;
            coef_.forEach(function (v, i) {
                res[n] += (n-i) >= 0 ? v * array.val[n-i] : 0;
            });
        }

        return array.set(res);
    };

    array.iir = function () {
        return array;
    };

    /* NOMINAL */

    // TODO: copy-paste the count function
    /**
     * Generates a histogram from a nominal array, such as the string type.
     * @function module:array#histogram
     * @returns {dtm.array}
     */
    array.histogram = function () {
        // CHECK: this is hacky
        params.type = 'string'; // re-set the type to string from number
        return array.set(toFloat32Array(histo(array.val)));
    };

    /**
     * Probability mass function
     * @returns {dtm.array}
     */
    array.pmf = function () {
        if (!isNestedDtmArray(array)) {
            return array.count().mult(1/array.get('sum'));
        } else {
            return array;
        }
    };

    array.dist = array.pmf;

    array.entropy = function () {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.entropy();
            })
        } else {
            var dist = array.pmf().unnest();
            return dist.map(function (v) {
                return v * Math.log2(v);
            }).sum().mult(-1);
        }
    };

    /**
     *
     * @returns {*}
     */
    array.randomtrigger = function (dist) {
        if (!isString(dist)) {
            dist = 'uniform';
        }

        if (isNestedNumDtmArray(array)) {
            return array.map(function (a) {
                return a.randomtrigger();
            });
        } else if (isNumDtmArray(array)) {
            return array.map(function (v) {
                if (Math.random() <= v) {
                    return 1.0;
                } else {
                    return 0.0;
                }
            });
        } else {
            return array;
        }
    };

    array.randtrig = array.randomtrigger;

    array.count = function () {
        var res = [];
        objForEach(countOccurrences(array.get()), function (v, k) {
            res.push(dtm.a(v).label(k).parent(array));
        });
        return array.set(res);
    };

    /**
     * Overwrites the contents with unsorted unique values of the array.
     * @function module:array#uniq | unique
     * @returns {dtm.array}
     */
    array.unique = function () {
        return array.set(dtm.transform.unique(array.val));
    };

    // TODO: id by occurrence / rarity, etc.
    /**
     * @function module:array#classify
     * @param by
     * @returns {dtm.array}
     */
    array.classify = function (by) {
        return array.set(dtm.transform.classId(array.val));
    };

    /**
     * Converts the array values (such as numbers) into string format.
     * @function module:array#stringify | tostring
     * @returns {dtm.array}
     */
    array.stringify = function () {
        return array.set(dtm.transform.stringify(array.val));
    };

    /**
     * Converts string or boolean values to numerical values.
     * @function module:array#tonumber | toNumber
     * @returns {dtm.array}
     */
    array.tonumber = function () {
        if (isParsableNumArray(array.val) || isBoolArray(array.val)) {
            return array.set(toFloat32Array(dtm.transform.tonumber(array.val)));
        } else {
            return array;
        }
    };

    array.toFloat32 = function () {
        if (isNumArray(array.val)) {
            array.set(toFloat32Array(array.val));
        }
        return array;
    };

    // CHECK: occurrence or value??
    // TODO: remove empty columns
    array.morethan = function (val) {
        if (isNestedDtmArray(array)) {
            array.forEach(function (a) {
                a.morethan(val);
            });
        } else {
            array.filter(function (v) {
                return v > val;
            });
        }
        return array.removeempty();
    };

    array.mtet = function (val) {
        if (isNestedDtmArray(array)) {
            array.forEach(function (a) {
                a.mtet(val);
            });
        } else {
            array.filter(function (v) {
                return v >= val;
            });
        }
        return array;
    };

    array.lessthan = function () {
        if (isNestedDtmArray(array)) {
            array.forEach(function (a) {
                a.lessthan(val);
            });
        } else {
            array.filter(function (v) {
                return v < val;
            });
        }
        return array;
    };

    array.ltet = function () {
        if (isNestedDtmArray(array)) {
            array.forEach(function (a) {
                a.ltet(val);
            });
        } else {
            array.filter(function (v) {
                return v <= val;
            });
        }
        return array;
    };

    array.removeempty = function () {
        var newArr = [];
        if (isNestedDtmArray(array)) {
            array.forEach(function (a) {
                if (a.get(0).constructor.name === 'Float32Array') {
                    if (a.get(0).length > 0) {
                        newArr.push(a);
                    }
                } else {
                    newArr.push(a);
                }
            });
            return dtm.array(newArr);
        } else {
            array.forEach(function (v) {
                if (!isEmpty(v)) {
                    newArr.push(v);
                }
            });
            return dtm.array(newArr).label(array.get('name'));
        }
    };

    /* STRING OPERATIONS */

    /**
     * Separates the array items into new array using the separator
     * @param [separator=''] {string}
     * @returns dtm.array
     */
    array.split = function (separator) {
        return array.set(dtm.transform.split(array.val, separator));
    };

    array.join = function (delimiter) {
        if (isNestedDtmArray(array)) {
            array.map(function (a) {
                return a.join(delimiter);
            });
        }

        if (!isString(delimiter)) {
            delimiter = '';
        }
        var res = '';
        array.forEach(function (v, i) {
            res += toString(v);
            if (i < array.length-1) {
                res += delimiter;
            }
        });

        return array.set(res);
    };

    /* MUSICAL */

    /**
     * Pitch quantize the array values. Shorthand: array.pq
     * @function module:array#pitchquantize
     * @param scale {array|dtm.array} A numerical or string (solfa -- e.g., 'do' or 'd' instead of 0) denoting the musical scale degrees.
     * @returns {dtm.array}
     */
    array.pitchquantize = function (scale) {
        if (isNestedDtmArray(array)) {
            return array.map(function (a) {
                return a.pitchquantize(scale);
            });
        }

        if (isEmpty(scale)) {
            scale = dtm.gen('range', 12).get();
        } else if (isDtmArray(scale) && isNumOrFloat32Array(scale.get())) {
            scale = scale.get();
        } else if (isNumOrFloat32Array(scale)) {

        }

        return array.set(dtm.transform.pitchQuantize(array.val, scale));
    };

    array.mtof = function () {
        return array.set(dtm.transform.mtof(array.val));
    };

    array.ftom = function () {
        return array.set(dtm.transform.ftom(array.val));
    };



    /* UNIT CONVERTERS */

    /**
     * Converts note values into a beat sequence.
     * @function module:array#notesToBeats | ntob
     * @param [resolution=4] {number}
     * @returns {dtm.array}
     */
    array.notesToBeats = function (resolution) {
        resolution = resolution || 4;
        return array.set(dtm.transform.notesToBeats(array.val, resolution));
    };

    /**
     * Converts beat sequence into note values.
     * @function module:array#beatsToNotes | bton
     * @param [resolution=4] {number}
     * @returns {dtm.array}
     */
    array.beatsToNotes = function (resolution) {
        resolution = resolution || 4;
        return array.set(dtm.transform.beatsToNotes(array.val, resolution));
    };

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:array#intervalsToBeats | itob
     * @returns {dtm.array}
     */
    array.intervalsToBeats = function (arr) {
        var ampseq;

        if (isNumDtmArray(arr)) {
            ampseq = arr.val;
        } else if (isNumOrFloat32Array(arr)) {
            ampseq = arr;
        }
        return array.set(dtm.transform.intervalsToBeats(array.val, ampseq));
    };

    /**
     * Converts beat sequence into intervalic values.
     * @function module:array#beatsToIntervals | btoi
     * @returns {dtm.array}
     */
    array.beatsToIntervals = function () {
        return array.set(dtm.transform.beatsToIntervals(array.val));
    };
    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:array#beatsToTime
     * @returns {dtm.array}
     */
    array.beatsToTime = function () {
        return array.set(dtm.transform.beatsToIndices(array.val));
    };

    /**
     * function module:array#timeToBeats
     * @param [len]
     * @returns {dtm.array}
     */
    array.timeToBeats = function (len) {
        return array.set(dtm.transform.indicesToBeats(array.val, len));
    };


    /* aliases */

    array.histo = array.histogram;
    array.uniq = array.unique;
    array.class = array.classify;
    array.tostring = array.stringify;
    array.tonum = array.tonumber;
    array.num = array.tonumber;
    array.mt = array.morethan;
    array.lt = array.lessthan;
    array.pq = array.pitchquantize;
    array.ntob = array.notesToBeats;
    array.bton = array.beatsToNotes;
    array.itob = array.intervalsToBeats;
    array.btoi = array.beatsToIntervals;
    array.btot = array.beatsToIndices;
    array.ttob = array.indicesToBeats;


    /* dtm.generator placeholders */
    // these are not really necessary, but prevents typeError when calling dtm.gen functions on pure dtm.array object
    array.type = function () { return array; };
    array.size = function () { return array; };

    array.call = function (fn) {
        if (isFunction(fn)) {
            if (arguments.length > 1) {

            }
            fn(array);
        }
        return array;
    };
    array.do = array.call;

    array.plot = function () {
        if (isFunction(dtm.params.plotter)) {
            dtm.params.plotter.apply(this, [array].concat(argsToArray(arguments)));
        }
        return array;
    };

    array.print = function () {
        if (isFunction(dtm.params.printer)) {
            dtm.params.printer.apply(this, [array].concat(argsToArray(arguments)));
        } else {
            dtm.util.print(array);
        }
        return array;
    };

    // set the array content here
    array.set.apply(this, arguments);
    return array;
};

dtm.a = dtm.array;
/**
 * @fileOverview The dtm.data class provides many transformation and analysis methods, and can be passed to the parameters of dtm.music object.
 * @module data
 */

/**
 * Creates a new single dimensional array object with various transformation functions. The same helper functions from dtm.data can be used - but make sure to skip the first argument (the input array) and start from the second argument.
 *
 * @function module:data.data
 * @returns array object {{value: null, normalized: null, length: null, min: null, max: null, mean: null}}
 */
dtm.d = dtm.data = function () {
    // array.sort.by = array.sortby;

    // array.subarray = function () {
    //     return array;
    // };
    //
    // // TODO: regexp-like processing???
    // array.match = function () {
    //     return array;
    // };
    //
    // array.pick = function () {
    //     return array;
    // };
    //
    // // TODO: impelemnt
    // array.replaceat = function (idx, val) {
    //     return array;
    // };


    // array.remove.at = function (input) {
    //     var at = [];
    //     var val = array.val;
    //
    //     if (argsAreSingleVals(arguments)) {
    //         if (isNumArray(argsToArray(arguments))) {
    //             at = argsToArray(arguments);
    //         }
    //     } else if (isNumOrFloat32Array(input)) {
    //         at = input;
    //     } else if (isNumDtmArray(input)) {
    //         at = input.get();
    //     }
    //
    //     at.forEach(function (i) {
    //         val = splice(val, Math.round(i), 1);
    //     });
    //     return array.set(val);
    // };


    // /**
    //  * Removes zeros from the sequence.
    //  * @function module:data#removezeros
    //  * @returns {dtm.data}
    //  */
    // array.removezeros = function () {
    //     return array.set(dtm.transform.removeZeros(array.val));
    // };
    //
    // array.removevalue = function () {
    //     return array;
    // };

    // array.iir = function () {
    //     return array;
    // };

    var data = new Data();
    return data.set.apply(data, arguments);
};

/**
 * Add new function to the dtm.data prototype.
 * @param fnList
 */
dtm.data.augment = function (fnList) {
    objForEach(fnList, function (obj, name) {
        if (name === 'aliases') {
            objForEach(obj, function (arr, key) {
                arr.forEach(function (v) {
                    if (!isEmpty(Data.prototype[v])) {
                        console.log('The function name ' + key + ' already exists! Overwriting...');
                    }
                    Data.prototype[v] = fnList[key];

                    Each.prototype[v] = function () {
                        var data = this.data;
                        var args = arguments;

                        if (isNestedDtmArray(data)) {
                            data.each(function (a) {
                                a[v].apply(a, args);
                            });
                            return data;
                        } else {
                            var res = [];
                            data.each(function (w) {
                                var d = dtm.data(w);
                                res = concat(res, d[v].apply(d, args).get());
                            });
                            return data.set(res);
                        }
                    };

                    Map.prototype[v] = function () {
                        var data = this.data;
                        var args = arguments;

                        if (isNestedDtmArray(data)) {
                            return data.map(function (a) {
                                return a[v].apply(a, args);
                            });
                        } else {
                            var res = [];
                            data.each(function (w) {
                                var d = dtm.data(w);
                                res = concat(res, d[v].apply(d, args).get());
                            });
                            return data.set(res);
                        }
                    };
                });
            });
        } else {
            if (isFunction(obj)) {
                if (!isEmpty(Data.prototype[name])) {
                    console.log('The function name ' + name + ' already exists! Overwriting...');
                }
                Data.prototype[name] = obj;

                Each.prototype[name] = function () {
                    var data = this.data;
                    var args = arguments;

                    if (isNestedDtmArray(data)) {
                        data.each(function (a) {
                            a[name].apply(a, args);
                        });
                        return data;
                    } else {
                        var res = [];
                        data.each(function (v) {
                            var d = dtm.data(v);
                            res = concat(res, d[name].apply(d, args).get());
                        });
                        return data.set(res);
                    }
                };

                Map.prototype[name] = function () {
                    var data = this.data;
                    var args = arguments;

                    if (isNestedDtmArray(data)) {
                        return data.map(function (a) {
                            return a[name].apply(a, args);
                        });
                    } else {
                        var res = [];
                        data.each(function (v) {
                            var d = dtm.data(v);
                            res = concat(res, d[name].apply(d, args).get());
                        });
                        return data.set(res);
                    }
                };
            }
        }
    });
};

// TODO: this could be in the augment function without having to use the arguments.callee, and with special-case notation for nested data if desired.
function mapNested(that, args, fn) {
    if (isNestedDtmArray(that)) {
        if (isEmpty(fn)) {
            fn = args.callee;
        }

        that.each(function (v) {
            fn.apply(v, args);
        });

        return that;
    } else {
        return null;
    }
}

// function addNestedProperty(Class, fn) {
//     Class.prototype[fn] = function () {
//         var data = this.data;
//         var args = arguments;
//
//         if (isNestedDtmArray(data)) {
//             return data.map(function (a) {
//                 return a[fn].apply(a, args);
//             });
//         } else {
//             return data;
//         }
//     };
// }

function Data() {
    // callable object
    function data() {
        return data.clone.apply(data, arguments);
    }

    // inherit callable Function.prototype
    data.__proto__ = Data.prototype;

    data.val = [];
    data.length = 0;

    data.params = {
        name: '',
        parent: null,
        original: null,
        id: Math.random(),
        trace: false,
        interceptor: {},
        targets: {},
        processFn: null,
        isTarget: false,
        attachedFn: null,
        nested: false,
        depth: 1
    };

    data.meta = {
        type: 'dtm.data',
        getParams: function () {
            return data.params;
        },
        addParams: function (paramsExt) {
            objForEach(paramsExt, function (val, key) {
                data.params[key] = val;
            });
            return data;
        },
        setOriginal: function (obj) {
            data.params.original = obj;
            return data;
        },
        // reassignSelf: function (newDataObj) {
        //     // TODO: does not work
        //     data = newDataObj;
        //     return data;
        // },
        setInterceptor: function (fn) {
            data.params.interceptor.get = fn;
            return data;
        }
    };

    Object.defineProperty(data, 'length', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: 0
    });

    // cannot override?
    Object.defineProperty(data, 'name', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: ''
    });

    // TODO: what's this for? I forgot...
    this.__proto__ = Data.prototype;

    if (Data.prototype.traceGlobal) {
        var org = data;
        data = new Proxy(data, data.params.interceptor);
        data.toString = Function.prototype.toString.bind(org);
    }

    // TODO: the order here with the toString fix might cause problems
    data.forEach = data.foreach = data.each = new Each(data);
    data.map = new Map(data);
    data.g = data.group = data.b = data.block = new Block(data);
    data.flatten = data.ug = data.ungroup = data.ub = data.unblock = new UnBlock(data);
    data.f = data.fit = new Fit(data);
    data.s = data.str = data.stretch = new Stretch(data);
    data.fft = new FFT(data);

    return data;
}

// make data instance callable
Data.prototype = Object.create(Function.prototype);
Data.prototype.traceGlobal = false;

function Each(data) {
    /**
     * Performs JS Array.map function to the array values.
     * @function module:data#map
     * @param fn
     * @returns {dtm.data}
     */
    function each(fn) {
        var i, l = data.length;
        if (isNestedDtmArray(data)) {
            for (i = 0; i < l; i++) {
                fn(each.data.val[i], i, each.data);
            }
        } else {
            for (i = 0; i < l; i++) {
                fn(dtm.data(each.data.val[i]), i, each.data);
            }
        }
        return each.data;
    }

    each.data = data;
    each.__proto__ = Each.prototype;

    return each;
}

Each.prototype = Object.create(Function.prototype);

function Map(data) {
    function map(fn) {
        var i, l = data.length;
        var res = new Array(l);

        if (isNestedDtmArray(data)) {
            for (i = 0; i < l; i++) {
                res[i] = fn(data.val[i], i, data);
            }
            data.val = res;
            return data;
        } else {
            for (i = 0; i < l; i++) {
                res[i] = fn(dtm.data(data.val[i]), i, data);
            }
            return data.set(res).flatten();
        }
    }

    map.data = data;
    map.__proto__ = Map.prototype;

    return map;
}

Map.prototype = Object.create(Function.prototype);

function Block(data) {
    // TODO: accept option as arg? for numBlocks, pad, overlap ratio, etc.
    function block(len, hop, window, tail) {
        if (!isInteger(len) || len < 1) {
            len = 1;
        } else if (len > this.length) {
            len = this.length;
        }
        if (!isInteger(hop) || hop < 1) {
            hop = len;
        }
        if (isEmpty(window)) {
            window = 'rectangular';
        }
        if (!isString(tail)) {
            tail = 'wrap';
        }

        var newArr = [];
        var numBlocks = Math.floor((data.length - len) / hop) + 1;

        for (var i = 0; i < numBlocks; i++) {
            // name: original starting index
            newArr[i] = dtm.data(data.val.slice(i*hop, i*hop+len)).parent(data).label((i*hop).toString());

            if (window !== 'rectangular') {
                newArr[i].window(window);
            }
        }

        return data.set(newArr);
    }

    block.data = data;
    block.__proto__ = Block.prototype;

    // ['g', 'group', 'b', 'block'].forEach(function (name) {
    //     // Data.prototype[name] = block;
    //
    //     Each.prototype[name] = function () {
    //         var data = this.data;
    //         var args = arguments;
    //
    //         if (isNestedDtmArray(data)) {
    //             data.each(function (d) {
    //                 d[name].apply(d, args);
    //             });
    //             return data;
    //         } else {
    //             var res = [];
    //             data.each(function (d) {
    //                 res = concat(res, d[name].apply(d, args).get());
    //             });
    //             return data.set(res);
    //         }
    //     };
    //
    //     Map.prototype[name] = function () {
    //         var data = this.data;
    //         var args = arguments;
    //
    //         if (isNestedDtmArray(data)) {
    //             return data.map(function (d) {
    //                 return d[name].apply(d, args);
    //             });
    //         } else {
    //             var res = [];
    //             data.each(function (d) {
    //                 res = concat(res, d[name].apply(d, args).get());
    //             });
    //             return data.set(res);
    //         }
    //     };
    // });

    return block;
}

Block.prototype = Object.create(Function.prototype);

Block.prototype.into = function (val) {
    var data = this.data;

    if (isInteger(val)) {
        var len = Math.floor(data.length / val);
        return data.block(len);
    } else {
        return data;
    }
};

Block.prototype.if = Block.prototype.when = function (fn) {
    var data = this.data;
    var newArr = [dtm.data()];

    data.each(function (d, i) {
        if (i > 0 && fn(d, i, data)) {
            newArr.push(dtm.data(d.get(0)));
        } else {
            newArr[newArr.length-1].concat(d.get(0));
        }
    });

    return data.set(newArr);
};

// Block.prototype.at = function (index) {};

Block.prototype.by = function () {
    var data = this.data;
    return data;
};

Block.prototype.peak = Block.prototype.peaks = function (shift) {
    var data = this.data;
    var diff = data().diff(1);
    var pair = shift ? 1 : 0;

    return data.block.if(function (d, i) {
        return diff(i).mult(diff(i+1)).get(0) < 0;
    }).unblock.if(function (d, i) {
        return i % 2 === pair;
    });
};

function UnBlock(data) {
    function unblock() {
        if (isNestedDtmArray(data)) {
            var flattened = [];
            for (var i = 0, l = data.val.length; i < l; i++) {
                if (isDtmArray(data.val[i])) {
                    flattened = concat(flattened, data.val[i].val);
                }
            }

            if (isNumArray(flattened)) {
                flattened = toFloat32Array(flattened);
            }

            data.params.depth--;
            if (data.params.depth === 1) {
                data.params.nested = false;
            }

            return data.set(flattened);
        } else {
            return data;
        }
    }

    unblock.data = data;
    unblock.__proto__ = UnBlock.prototype;
    return unblock;
}

UnBlock.prototype = Object.create(Function.prototype);

UnBlock.prototype.if = UnBlock.prototype.when = function (fn) {
    var data = this.data;
    var newArr = [dtm.data().label('0')];

    data.each(function (d, i) {
        if (i === 0 || fn(d, i, data)) {
            newArr[newArr.length-1].concat(d.get());
        } else {
            newArr.push(d.label(i.toString()));
        }
    });

    return data.set(newArr);
};

function Fit(data) {
    /**
     * Stretches or shrinks the length of the array into the specified length.
     * @function module:data#fit
     * @param len {number} Integer
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    function fit(len, interp) {
        if (isNestedDtmArray(data)) {
            return data.map(function (a) {
                return a.fit(len, interp);
            });
        }
        return data.set(dtm.transform.fit(data.val, len, interp));
    }

    fit.data = data;
    fit.__proto__ = Fit.prototype;

    // ['fit', 'f'].forEach(function (name) {
    //     Each.prototype[name] = function () {
    //         var data = this.data;
    //         var args = arguments;
    //
    //         if (isNestedDtmArray(data)) {
    //             data.each(function (d) {
    //                 d[name].apply(d, args);
    //             });
    //             return data;
    //         } else {
    //             var res = [];
    //             data.each(function (d) {
    //                 res = concat(res, d[name].apply(d, args).get());
    //             });
    //             return data.set(res);
    //         }
    //     };
    //
    //     Map.prototype[name] = function () {
    //         var data = this.data;
    //         var args = arguments;
    //
    //         if (isNestedDtmArray(data)) {
    //             return data.map(function (d) {
    //                 return d[name].apply(d, args);
    //             });
    //         } else {
    //             var res = [];
    //             data.each(function (d) {
    //                 res = concat(res, d[name].apply(d, args).get());
    //             });
    //             return data.set(res);
    //         }
    //     };
    // });

    return fit;
}

Fit.prototype = Object.create(Function.prototype);

Fit.prototype.linear = Fit.prototype.line = function (len) {
    var data = this.data;
    return data.fit(len, 'line');
};

Fit.prototype.step = function (len) {
    var data = this.data;
    return data.fit(len, 'step');
};

Fit.prototype.cos = Fit.prototype.cosine = function (len) {
    var data = this.data;
    return data.fit(len, 'cos');
};

Fit.prototype.cub = Fit.prototype.cubic = function (len) {
    var data = this.data;
    return data.fit(len, 'cubic');
};

function Stretch(data) {
    /**
     * Multiplies the length of the array by the given factor.
     * @function module:data#stretch
     * @param factor {number}
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    function stretch (factor, interp) {
        if (isNestedDtmArray(data)) {
            return data.map(function (a) {
                return a.stretch(factor, interp);
            })
        }

        return data.set(dtm.transform.stretch(data.val, factor, interp));
    }

    stretch.data = data;
    stretch.__proto__ = Stretch.prototype;

    // ['stretch', 'str', 's'].forEach(function (name) {
    //     Each.prototype[name] = function () {
    //         var data = this.data;
    //         var args = arguments;
    //
    //         if (isNestedDtmArray(data)) {
    //             data.each(function (a) {
    //                 a[name].apply(a, args);
    //             });
    //             return data;
    //         } else {
    //             return data;
    //         }
    //     };
    //
    //     Map.prototype[name] = function () {
    //         var data = this.data;
    //         var args = arguments;
    //
    //         if (isNestedDtmArray(data)) {
    //             return data.map(function (a) {
    //                 return a[name].apply(a, args);
    //             });
    //         } else {
    //             return data;
    //         }
    //     };
    // });

    return stretch;
}

Stretch.prototype = Object.create(Function.prototype);

Stretch.prototype.linear = Stretch.prototype.line = function (factor) {
    var data = this.data;
    return data.stretch(factor, 'line');
};

Stretch.prototype.step = function (factor) {
    var data = this.data;
    return data.stretch(factor, 'step');
};

Stretch.prototype.cos = Stretch.prototype.cosine = function (factor) {
    var data = this.data;
    return data.stretch(factor, 'cos');
};

Stretch.prototype.cub = Stretch.prototype.cubic = function (factor) {
    var data = this.data;
    return data.stretch(factor, 'cubic');
};

function FFT(data) {
    function fft() {
        return data.set(dtm.transform.fft(data.val));
    }

    fft.__proto__ = FFT.prototype;
    fft.data = data;

    return fft;
}

FFT.prototype = Object.create(Function.prototype);

FFT.prototype.filter = function (magSpec) {
    var timeSigData = new Float32Array(this.data.val);
    var timeSigPtr = Module._malloc(timeSigData.byteLength);
    var timeSigView = new Float32Array(Module.HEAPF32.buffer, timeSigPtr, timeSigData.length);
    timeSigView.set(timeSigData);

    var magSpecData = new Float32Array(magSpec.val);
    var magSpecPtr = Module._malloc(magSpecData.byteLength);
    (new Float32Array(Module.HEAPF32.buffer, magSpecPtr, magSpecData.length)).set(magSpecData);

    Module.ccall('fftFilter', null, ['number', 'number', 'number'], [timeSigPtr, magSpecPtr, timeSigData.length]);

    Module._free(timeSigPtr);
    Module._free(magSpecPtr);
    return this.data.set(timeSigView);
};

FFT.prototype.vsc = function (fs) {
    if (!isNumber(fs)) {
        fs = 44100;
    }
    var timeSigData = new Float32Array(this.data.val);
    var timeSigPtr = Module._malloc(timeSigData.byteLength);
    var timeSigView = new Float32Array(Module.HEAPF32.buffer, timeSigPtr, timeSigData.length);
    timeSigView.set(timeSigData);

    var res = Module.ccall('spectralCentroid', 'number', ['number', 'number', 'number'], [timeSigPtr, timeSigData.length, fs]);

    if (isNumber(res)) {
        this.data.set(res);
    } else {
        this.data.set(0);
    }

    return this.data;
};

/* basic functions */
dtm.data.augment({
    aliases: {
        name: ['label', 'key'],
        names: ['keys', 'indices'],
        clear: ['flush'],
        res: ['residue']
    },

    /**
     * Sets or overwrites the contents of the data object.
     * @function module:data#set
     * @returns {dtm.data}
     */
    set: function () {
        var that = this;

        if (arguments.length === 0) {
            return that;
        }

        if (argsAreSingleVals(arguments)) {
            var args = argsToArray(arguments);
            if (isNumArray(args)) {
                that.val = new Float32Array(args);
            } else {
                that.val = args;
            }
        } else {
            // if set arguments include any array-like object
            if (arguments.length === 1) {
                if (isNumber(arguments[0])) {
                    that.val = toFloat32Array(arguments[0]);
                } else if (isNestedDtmArray(arguments[0])) {
                    that.val = arguments[0].get();
                    that.val.forEach(function (v) {
                        v.parent(that);
                    });
                    that.params.nested = true;
                    that.params.depth += arguments[0].params.depth;
                } else if (isDtmArray(arguments[0])) {
                    that = arguments[0]; // retain the reference
                    // set parent in the child
                } else if (isNumArray(arguments[0])) {
                    that.val = toFloat32Array(arguments[0]);
                } else if (isNestedArray(arguments[0])) {
                    that.val = new Array(arguments[0].length);
                    var childDepth = 1;
                    for (var i = 0, l = arguments[0].length; i < l; i++) {
                        that.val[i] = dtm.data(arguments[0][i]).parent(that);
                        if (that.val[i].params.depth > childDepth) {
                            childDepth = that.val[i].params.depth;
                        }
                    }
                    that.params.nested = true;
                    that.params.depth += childDepth;
                } else if (isNestedWithDtmArray(arguments[0])) {
                    that.val = new Array(arguments[0].length);
                    // var childDepth = getMaxArrayDepth(that.val);
                    for (var i = 0, l = arguments[0].length; i < l; i++) {
                        that.val[i] = arguments[0][i].parent(that);
                        // if (that.val[i].params.depth > childDepth) {
                        //     childDepth = that.val[i].params.depth;
                        // }
                    }
                    that.params.nested = true;
                    // that.params.depth += childDepth;
                    that.params.depth = getMaxArrayDepth(that.val);
                } else if (isString(arguments[0])) {
                    that.val = [arguments[0]]; // no splitting
                    checkType(that.val);
                } else {
                    that.val = arguments[0];
                }
            } else {
                that.val = new Array(arguments.length);

                var childDepth = 1;
                argsForEach(arguments, function (v, i) {
                    if (isDtmArray(v)) {
                        that.val[i] = v;
                    } else {
                        that.val[i] = dtm.data(v);
                    }
                    that.val[i].parent(that);

                    if (v.params.depth > childDepth) {
                        childDepth = that.val[i].params.depth;
                    }
                });

                that.params.nested = true;
                that.params.depth += childDepth;
            }
        }

        if (isEmpty(that.params.original)) {
            that.params.original = that.val;
        }

        that.length = that.val.length;
        that.params.index = that.length - 1;

        return that;
    },

    // TODO: list different query params in detail in the documentation
    /**
     * Returns the array contents or an analyzed value
     * @function module:data#get
     * @param [param] {string|number} If no argument is given, returns the array content. If given a number, returns the value at the index. If given a valid string, the value / stats / etc. is returned. Possible string keys are as follows: name|key, type, len|length, min|minimum, max|maximum, minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block|window (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram
     * @returns {number|array|string}
     */
    get: function (param) {
        var that = this;

        if (isNumber(param)) {
            // TODO: support multiple single val arguments?
            if (!isInteger(param)) {
                param = Math.round(param)
            }

            return that.val[mod(param, that.length)];
        } else if (isArray(param) || isDtmArray(param)) {
            var indices = isDtmArray(param) ? param.get() : param;
            var res = [];

            // TODO: only accept integers

            for (var n = 0, l = indices.length; n < l; n++) {
                var i = indices[n];
                if (isNumber(i)) {
                    if (!isInteger(i)) {
                        i = Math.round(i);
                    }
                    res.push(that.val[mod(i, that.length)]);
                } else if (isString(i) && isNestedDtmArray(that)) {
                    that.each(function (a) {
                        if (a.get('name') === i) {
                            res.push(a);
                        }
                    });
                }
            }

            if (isNestedDtmArray(that)) {
                res = dtm.data(res);
            } else if (isFloat32Array(that.val)) {
                res = toFloat32Array(res);
            }

            return res;

        } else if (isString(param)) {
            switch (param) {
                case 'getters':
                case 'help':
                case '?':
                    return 'name|key, type, len|length, min|minimum, max|maximum, extent|minmax|range, mean|avg|average, mode, median, midrange, std, pstd, var|variance, pvar, rms, cur|current|now, next, pver|previous, rand|random, idx|index, hop|step|stepSize, loc|location|relative, block (with 1|2 following numbers), blockNext, original, normal|normalize|normalized, sort|sorted, uniq|unique|uniques, classes, classID, string|stringify, numClasses|numUniques, unif|uniformity, histo|histogram'.split(', ');

                case 'methods':
                case 'functions':
                    return Object.keys(that);

                case 'name':
                case 'key':
                case 'label':
                    return that.params.name;

                case 'names':
                case 'keys':
                case 'labels':
                    if (isNestedDtmArray(that)) {
                        return that.val.map(function (a) {
                            return a.get('name');
                        });
                    } else {
                        return that.params.name;
                    }

                case 'type':
                    if (isNumArray(that.val)) {
                        return 'number';
                    } else if (isFloat32Array(that.val)) {
                        return 'Float32Array'
                    } else if (isStringArray(that.val)) {
                        return 'string';
                    } else if (isNestedDtmArray(that)) {
                        return 'nested';
                    } else {
                        return 'mixed';
                    }

                case 'parent':
                    return that.params.parent;

                case 'len':
                case 'length':
                    return that.length;

                case 'size':
                    if (isNestedDtmArray(that)) {
                        return { row: that.val[0].get('len'), col: that.length };
                    } else {
                        return that.length;
                    }

                case 'autolen':
                    return that.params.autolen;

                case 'hash':
                    return that.params.hash;

                case 'processed':
                    return that.params.processed;

                case 'nested':
                    return that.val.map(function (v) {
                        if (isDtmArray(v)) {
                            return v.get();
                        } else {
                            return v;
                        }
                    });

                case 'row':
                    if (isInteger(arguments[1]) && isNestedDtmArray(that)) {
                        var idx = arguments[1];
                        res = [];
                        that.each(function (d) {
                            res.push(d.get(idx));
                        });
                        if (isNumArray(res)) {
                            res = toFloat32Array(res);
                        }
                        return res;
                    } else {
                        break;
                    }

                /* STATS */
                case 'minimum':
                case 'min':
                    return getMin(that.val);

                case 'maximum':
                case 'max':
                    return getMax(that.val);

                case 'extent':
                case 'minmax':
                case 'range':
                    return [getMin(that.val), getMax(that.val)];

                case 'mean':
                case 'average':
                case 'avg':
                    return mean(that.val);

                case 'mode':
                    return mode(that.val);
                case 'median':
                    return median(that.val);
                case 'midrange':
                    return midrange(that.val);

                case 'standardDeviation':
                case 'std':
                    return std(that.val);
                case 'pstd':
                    return pstd(that.val);

                case 'variance':
                case 'var':
                    return variance(that.val);
                case 'populationVariance':
                case 'pvar':
                    return pvar(that.val);

                case 'sumAll':
                case 'sum':
                    return sum(that.val);

                case 'rms':
                    return rms(that.val);

                case 'pdf':
                    break;

                case 'entropy':
                    return that.clone().entropy().get();

                /* ITERATORS */
                case 'current':
                case 'curr':
                case 'cur':
                case 'now':
                case 'moment':
                    return that.val[that.params.index];

                case 'next':
                    // TODO: increment after return
                    if (isEmpty(arguments[1])) {
                        that.params.index = mod(that.params.index + that.params.step, that.length);
                        return that.val[that.params.index];
                    } else if (isNumber(arguments[1]) && arguments[1] >= 1) {
                        // TODO: incr w/ the step size AFTER RETURN
                        that.params.index = mod(that.params.index + that.params.step, that.length);
                        blockArray = dtm.transform.getBlock(that.val, that.params.index, arguments[1]);
                        return dtm.data(blockArray);
                    } else {
                        return that;
                    }

                case 'prev':
                case 'previous':
                    that.params.index = mod(that.params.index - that.params.step, array.length);
                    return that.val[that.params.index];

                case 'palindrome':
                    break;

                case 'rand':
                case 'random':
                    that.params.index = randi(0, that.length);
                    return that.val[that.params.index];

                case 'urn':
                    break;

                case 'index':
                case 'idx':
                    return that.params.index;

                case 'hop':
                case 'hopSize':
                case 'step':
                case 'stepSize':
                    return that.params.step;

                case 'relative':
                case 'location':
                case 'loc':
                    break;

                case 'block':
                    var start, size, blockArray;
                    if (isArray(arguments[1])) {
                        start = arguments[1][0];
                        size = arguments[1][1];
                        blockArray = dtm.transform.getBlock(that.val, start, size);
                        return dtm.data(blockArray);
                    } else if (isNumber(arguments[1]) && isNumber(arguments[2])) {
                        start = arguments[1];
                        size = arguments[2];
                        blockArray = dtm.transform.getBlock(that.val, start, size);
                        return dtm.data(blockArray);
                    } else {
                        // CHECK: ???
                        return that.val;
                    }

                case 'blockNext':
                    // TODO: incr w/ the step size AFTER RETURN
                    that.params.index = mod(that.params.index + that.params.step, that.length);
                    blockArray = dtm.transform.getBlock(that.val, that.params.index, arguments[1]);
                    return dtm.data(blockArray);

                /* TRANSFORMED LIST */
                case 'original':
                    return that.params.original;
                    break;

                case 'normal':
                case 'normalize':
                case 'normalized':
                    if (isEmpty(that.params.normalized)) {
                        that.params.normalized = dtm.transform.normalize(that.val);
                    }
                    if (isInteger(arguments[1])) {
                        return that.params.normalized[mod(arguments[1], that.length)];
                    } else {
                        return that.params.normalized;
                    }

                case 'sorted':
                case 'sort':
                    return dtm.transform.sort(that.val);

                case 'uniques':
                case 'unique':
                case 'uniq':
                    return dtm.transform.unique(that.val);

                case 'classes':
                    return listClasses(that.val);

                case 'classID':
                case 'classId':
                    return dtm.transform.classId(that.val);

                case 'string':
                case 'stringify':
                    return dtm.transform.stringify(that.val);

                case 'numClasses':
                case 'numUniques':
                case 'numUniqs':
                    return listClasses(that.val).length;

                case 'unif':
                case 'uniformity':
                    return uniformity(that.val);

                case 'histogram':
                case 'histo':
                    return histo(that.val);

                // TODO: implement
                case 'distribution':
                case 'dist':
                    return [];

                default:
                    if (params.hasOwnProperty(param)) {
                        return that.params[param];
                    } else {
                        return that.val;
                    }
            }
        } else {
            //if (isNestedDtmArray(array)) {
            //    console.log(array.val.map(function (a) {
            //        return a.get();
            //    }));
            //    return array.val.map(function (a) {
            //        return a.get();
            //    });
            //} else {
            //    return array.val;
            //}
            return that.val;
        }

        return that.val;
    },

    len: function () {
        if (isNestedDtmArray(this)) {
            return this.map(function (v) { return v.length; });
        } else {
            return this.set(this.length);
        }
    },

    /**
     * Returns a copy of the array object. It can be used when you don't want to reference the same array object from different places. For convenience, you can also do arrObj() instead of arrObj.clone() to quickly return a copy.
     * @function module:data#clone
     * @returns {dtm.data}
     */
    clone: function () {
        if (arguments.length === 0) {
            var newValue;

            if (isNestedDtmArray(this)) {
                newValue = new Array(this.length);
                for (var i = 0, l = this.length; i < l; i++) {
                    newValue[i] = this.val[i].clone();
                }
            } else {
                newValue = this.val;
            }

            var newArr = dtm.data(newValue).label(this.params.name);
            newArr.meta.setOriginal(this.params.original);
            newArr.params.id = Math.random();

            if (this.params.type === 'string') {
                newArr.classes = this.params.classes;
                //newArr.setType('string');
            }
            return newArr;
        } else {
            return this.column.apply(this, arguments)
        }
    },

    /**
     * Sets the name of the array object.
     * @function module:data#name
     * @param name {string}
     * @returns {dtm.data}
     */
    name: function (name) {
        if (isString(name)) {
            this.params.name = name;
        }
        return this;
    },

    // TODO: not consistent with "name()"
    names: function () {
        if (isNestedDtmArray(this)) {
            var val = this.get('keys');
            this.params.depth--;
            if (this.params.depth === 1) {
                this.params.nested = false;
            }

            if (arguments.length > 0) {
                val = dtm.data(val).column(argsToArray(arguments)).ub();
            }
            return this.set(val);
        } else {
            return this;
        }
    },

    // return the parent if arg is empty
    parent: function (obj) {
        if (isDtmArray(obj)) {
            this.params.parent = obj;
        }
        return this;
    },

    /**
     * Overwrites the "original" state with the current state.
     * @returns {dtm.data}
     */
    save: function () {
        return this.meta.setOriginal(this.val);
    },

    /**
     * Retrieves the original values from when the array object was first created.
     * @function module:data#reset
     * @returns {dtm.data}
     */
    reset: function () {
        return this.set(this.params.original);
    },

    residue: function () {
        return this.set(dtm.transform.subtract(this.params.original, this.val));
    },

    /**
     * Clears all the contents of the array object.
     * @function module:data#flush | clear
     * @returns {dtm.data}
     */
    clear: function () {
        return this.set([]);
    }
});


dtm.data.augment({
    aliases: {
        mapvalue: ['mapval', 'mapv', 'mv'],
        eachvalue: ['eachval', 'eachv', 'ev']
    },

    mapvalue: function (fn) {
        var i, l = this.length;
        var res = new Array(l);

        if (isNestedDtmArray(this)) {
            for (i = 0; i < l; i++) {
                res[i] = fn(this.val[i].val, i, this);
            }
            this.val = res;
            return this;
        } else {
            for (i = 0; i < l; i++) {
                res[i] = fn(this.val[i], i, this);
            }
            return this.set(res);
        }
    },

    eachvalue: function (fn) {
        var i, l = this.length;
        if (isNestedDtmArray(this)) {
            for (i = 0; i < l; i++) {
                fn(this.val[i].val, i, this);
            }
        } else {
            for (i = 0; i < l; i++) {
                fn(this.val[i], i, this);
            }
        }
        return this;
    }
});

/* elaborated accessors */
dtm.data.augment({
    aliases: {
        column: ['col'],
        interpolate: ['interp', 'itp'],
        phase: ['p']
    },

    column: function () {
        var args = flatten(argsToArray(arguments));
        var res = [];
        var that = this;

        // TODO: query by dtm.array not working as same as by regular array

        if (isNestedDtmArray(this)) {
            var lastKey = '';

            for (var i = 0, l = args.length; i < l; i++) {
                var query = args[i];

                if (isDtmArray(query)) {
                    if (isNumArray(query.val)) {
                        res.push(this.get(query).val);
                    } else {
                        var queryList = [];
                        query.each(function (d) {
                            var v = d.get(0);
                            if (isString(v)) {
                                var idx = that.get('keys').indexOf(v);
                                if (idx > -1) {
                                    queryList.push(idx);
                                }
                            } else if (isInteger(v)) {
                                queryList.push(v);
                            }
                        });

                        // why
                        if (queryList.length === 1) {
                            res.push(this.get(queryList[0]).val);
                        } else {
                            res.push(this.get(queryList).val);
                        }
                    }
                } else if (isString(query)) {
                    for (var ii = 0, ll = this.length; ii < ll; ii++) {
                        if (this.val[ii].get('name') === query) {
                            res.push(this.val[ii].clone());
                        }
                    }
                } else {
                    res.push(this.get(query));
                }
            }

            if (args.length === 1) {
                if (isDtmArray(res[res.length-1])) {
                    lastKey = res[res.length-1].get('key');
                }

                return dtm.data(res).ub().label(lastKey);
            } else {
                return dtm.data(res);
            }
        } else {
            for (var i = 0, l = args.length; i < l; i++) {
                var query = args[i];
                res.push(this.get(query));
            }
            if (args.length === 1) {
                return dtm.data(res).ub();
            } else {
                return dtm.data(res);
            }
        }
    },

    /**
     * Returns a row of a nested array by the index.
     * @param num
     * @returns {dtm.data}
     */
    row: function (num) {
        var res = this.get('row', num);
        this.params.depth--;
        if (this.params.depth === 1) {
            this.params.nested = false;
        }
        return this.set(res).label(num.toString());
    },

    // memo: only for single-dimensional numerical interpolation
    // mode: linear, step (round), ...
    // aliases: interp, itp
    interpolate: function (at, mode) {
        var that = this;

        if (!isString(mode)) {
            mode = 'linear';
        }

        var res = [];
        var indices = [];

        if (isNumber(at)) {
            indices[0] = at;
        } else if (isNumOrFloat32Array(at)) {
            indices = at;
        } else if (isNumDtmArray(at)) {
            indices = at.get();
        } else {
            return that;
        }

        // TODO: use for loop
        indices.forEach(function (i) {
            if (mode === 'step' || mode === 'round') {
                res.push(that.val[mod(Math.round(i), that.length)]);
            } else {
                var floor = mod(Math.floor(i), that.length);
                var ceil = mod(floor + 1, that.length);
                var frac = i - Math.floor(i);

                res.push(that.val[floor] * (1-frac) + that.val[ceil] * frac);
            }
        });

        return that.set(res);
    },

    // interp with index scaled to the 0-1 range
    phase: function (at, mode) {
        var that = this;

        if (!isString(mode)) {
            mode = 'linear';
        }

        var res = [];
        var indices = [];

        if (isNumber(at)) {
            indices[0] = at;
        } else if (isNumOrFloat32Array(at)) {
            indices = at;
        } else if (isNumDtmArray(at)) {
            indices = at.get();
        } else {
            return that;
        }

        if (isNestedDtmArray(this)) {
            return this.col(dtm.data(indices).mult(this.length).get());
        }

        var i;
        for (var j = 0, l = indices.length; j < l; j++) {
            i = indices[j];

            // phase >= 1 wraps to 0
            i = mod(i, 1) * (that.length-1);

            if (mode === 'step' || mode === 'round') {
                res.push(that.val[mod(Math.round(i), that.length)]);
            } else {
                var floor = mod(Math.floor(i), that.length);
                var ceil = mod(floor + 1, that.length);
                var frac = i - Math.floor(i);

                res.push(that.val[floor] * (1-frac) + that.val[ceil] * frac);
            }
        }

        return that.set(res);
    },

    // mirrored phase function
    mphase: function (at, mode) {
        var that = this;

        if (!isString(mode)) {
            mode = 'linear';
        }

        var res = [];
        var indices = [];

        if (isNumber(at)) {
            indices[0] = at;
        } else if (isNumOrFloat32Array(at)) {
            indices = at;
        } else if (isNumDtmArray(at)) {
            indices = at.get();
        } else {
            return that;
        }

        var i;
        for (var j = 0, l = indices.length; j < l; j++) {
            i = indices[j];

            // even number floor value gives positive direction
            // e.g., 0~1, 2~3, -1~-2
            // odd gives inverse direction
            if (mod(Math.floor(i), 2) === 0) {
                i = mod(i, 1);
            } else {
                i = 1 - mod(i, 1);
            }

            i *= (that.length-1); // rescale index range

            if (mode === 'step' || mode === 'round') {
                res.push(that.val[mod(Math.round(i), that.length)]);
            } else {
                var floor = mod(Math.floor(i), that.length);
                var ceil = mod(floor + 1, that.length);
                var frac = i - Math.floor(i);

                res.push(that.val[floor] * (1-frac) + that.val[ceil] * frac);
            }
        }

        return that.set(res);
    }
});

/* scalars */
dtm.data.augment({
    aliases: {
        range: ['r'],
        normalize: ['n'],
        unipolar: ['uni', 'up'],
        bipolar: ['bi', 'bp'],
        limit: ['clip'],
        expcurve: ['expc', 'ec'],
        logcurve: ['logc', 'lc'],
        curve: ['c']
    },

    /**
     * Modifies the range of the array. Shorthand: data.r
     * @function module:data#range
     * @param arg1 {number|array|dtm.data} The target minimum value of the scaled range.
     * @param arg2 {number|array|dtm.data} The target maximum value of the scaled range.
     * @param [arg3] {number} The minimum of the domain (original) value.
     * @param [arg4] {number} The maximum of the domain value.
     * @returns {dtm.data}
     * @example
     * // Specifying the output range
     * dtm.data([1, 2, 3]).range([0, 10]).get();
     * // or
     * dtm.data([1, 2, 3]).range(0, 10).get();
     * -> [0, 5, 10]
     *
     * // Specifying the domain values (the second array in the argument)
     * dtm.data([1, 2, 3]).range([0, 10], [0, 5]).get();
     * // or
     * dtm.data([1, 2, 3]).range(0, 10, 0, 5).get();
     * -> [2, 4, 6]
     */
    range: function (arg1, arg2, arg3, arg4) {
        var that = this;
        var min, max, dmin, dmax;

        if (isNestedDtmArray(that)) {
            if (isNumber(arg3) && isNumber(arg4)) {
                dmin = arg3;
                dmax = arg4;
            } else {
                dmin = Infinity;
                dmax = -Infinity;

                that.forEach(function (a) {
                    dmin = a.get('min') < dmin ? a.get('min') : dmin;
                    dmax = a.get('max') > dmax ? a.get('max') : dmax;
                });
            }

            return that.map(function (a) {
                return a.range(arg1, arg2, dmin, dmax);
            });
        }

        // TODO: better typecheck order

        if (arguments.length === 0) {
            min = 0;
            max = 1;
        } else if (isNumber(arg1)) {
            if (arguments.length === 1) {
                min = 0;
                max = arg1;
            } else {
                min = arg1;
            }
        } else if (isNumArray(arg1)) {
            if (arg1.length >= 2) {
                min = arg1[0];
                max = arg1[1];
            }
            if (arg1.length > 2) {
                min = getMin(arg1);
                max = getMax(arg1);
            }
        } else if (isDtmArray(arg1) && isNumOrFloat32Array(arg1.get())) {
            if (arg1.get('len') === 2) {
                min = arg1.get(0);
                max = arg1.get(1);
            } else if (arg1.get('len') > 2) {
                min = arg1.get('min');
                max = arg1.get('max');
            }
        } else {
            return that;
        }

        if (isNumber(arg2)) {
            max = arg2;
        } else if (isNumArray(arg2) && arg2.length === 2) {
            dmin = arg2[0];
            dmax = arg2[1];
        }

        if (isNumber(arg3)) {
            dmin = arg3;
        } else if (isNumArray(arg3) && arg3.length === 2) {
            dmin = arg3[0];
            dmax = arg3[1];
        }

        if (isNumber(arg4)) {
            dmax = arg4;
        }

        return that.set(dtm.transform.rescale(that.val, min, max, dmin, dmax));
    },

    /**
     * Rescales the range of the numerical values to 0-1.
     * @function module:data#normalize
     * @param [arg1] {number} Prefered domain minimum value. If not present, the minimum of the input array is used.
     * @param [arg2] {number} Prefered domain maximum value. If not present, the maximum of the input array is used.
     * @returns {dtm.data}
     */
    normalize: function (arg1, arg2) {
        var that = this;
        var min, max, args;

        if (isNestedDtmArray(that)) {
            if (isNumber(arg1) && isNumber(arg2)) {
                min = arg1;
                max = arg2;
            } else {
                min = Infinity;
                max = -Infinity;

                that.forEach(function (a) {
                    min = a.get('min') < min ? a.get('min') : min;
                    max = a.get('max') > max ? a.get('max') : max;
                });
            }

            return that.map(function (a) {
                return a.normalize(min, max);
            });
        }

        if (isNumber(arg1) && isNumber(arg2)) {
            min = arg1;
            max = arg2;
        } else {
            if (isNumOrFloat32Array(arg1)) {
                args = arg1;
            } else if (isDtmArray(arg1) && isNumOrFloat32Array(arg1.get())) {
                args = arg1.get();
            }

            if (isNumOrFloat32Array(args)) {
                if (args.length === 2) {
                    min = args[0];
                    max = args[1];
                } else if (args.length > 2) {
                    min = getMin(args);
                    max = getMax(args);
                }
            }
        }

        return that.set(dtm.transform.normalize(that.val, min, max));
    },

    unipolar: function () {
        return this.range(0, 1);
    },

    bipolar: function (dc) {
        if (!isBoolean(dc)) {
            dc = false;
        }

        // TODO: this is wrong
        if (dc) {
            var mean = this.get('mean');
            var posSize = this.get('max') - mean;
            var negSize = mean - this.get('min');

            if (posSize >= negSize) {
                return this.range(-1, 1, mean - posSize, this.get('max'));
            } else {
                return this.range(-1, 1, this.get('min'), mean + negSize);
            }
        } else {
            return this.range(-1, 1);
        }
    },

    /**
     * Caps the array value range at the min and max values. Only works with a numerical array.
     * @function module:data#limit | clip
     * @param [min=0]
     * @param [max=1]
     * @returns {dtm.data}
     */
    limit: function (min, max) {
        if (isNumOrFloat32Array(this.val)) {
            min = min || 0;
            max = max || 1;
            return this.set(dtm.transform.limit(this.get(), min, max));
        } else {
            return this;
        }
    },

    /**
     * Scales the array with an exponential curve.
     * @function module:data#expcurve
     * @param factor {number}
     * @param [min=data.get('min')] {number}
     * @param [max=data.get('max')] {number}
     * @returns {dtm.data}
     */
    expcurve: function (factor, min, max) {
        if (isEmpty(min)) {
            min = this.get('min');
        }
        if (isEmpty(max)) {
            max = this.get('max');
        }

        var arr = dtm.transform.expCurve(dtm.transform.normalize(this.val), factor);
        return this.set(dtm.transform.rescale(arr, min, max));
    },

    /**
     * Applies a logarithmic scaling to the array.
     * @function module:data#logc | logcurve
     * @param factor {number}
     * @param [min=data.get('min')] {number}
     * @param [max=data.get('max')] {number}
     * @returns {dtm.data}
     */
    logcurve: function (factor, min, max) {
        if (isEmpty(min)) {
            min = this.get('min');
        }
        if (isEmpty(max)) {
            max = this.get('max');
        }

        var arr = dtm.transform.logCurve(dtm.transform.normalize(this.val), factor);
        return this.set(dtm.transform.rescale(arr, min, max));
    },

    curve: function (factor, min, max) {
        if (isEmpty(min)) {
            min = this.get('min');
        }
        if (isEmpty(max)) {
            max = this.get('max');
        }

        var arr;

        if (factor > 0) {
            arr = dtm.transform.logCurve(dtm.transform.normalize(this.val), factor+1);
        } else {
            arr = dtm.transform.expCurve(dtm.transform.normalize(this.val), -(factor)+1);
        }

        return this.set(dtm.transform.rescale(arr, min, max));
    }
});

/* interpolation and resampling */
dtm.data.augment({
    aliases: {
        linear: ['line', 'l'],
        cosine: ['cos'],
        cubic: ['cub'],
        slinear: ['sline', 'sl'],
        scosine: ['scos'],
        scubic: ['scub'],
        fitsum: ['fs', 'total']
    },

    linear: function (len) {
        return this.fit(len, 'linear');
    },

    step: function (len) {
        return this.fit(len, 'step');
    },

    cosine: function (len) {
        return this.fit(len, 'cos');
    },

    cubic: function (len) {
        return this.fit(len, 'cubic');
    },

    slinear: function (factor) {
        return this.stretch(factor, 'linear');
    },

    sstep: function (factor) {
        return this.stretch(factor, 'step');
    },

    scosine: function (factor) {
        return this.stretch(factor, 'cos');
    },

    scubic: function (factor) {
        return this.stretch(factor, 'cubic');
    },

    /**
     * Scales the values so that the sum fits the target value. Useful, for example, for fitting intervallic values to a specific measure length.
     * @function module:data#fitsum
     * @param tgt {number} If the round argument is true, the target value is also rounded.
     * @param [round=false] {boolean}
     * @returns {dtm.data}
     */
    fitsum: function (tgt, round, min) {
        return this.set(dtm.transform.fitSum(this.val, tgt, round));
    },

    /**
     * Morphs the array values with a target array / dtm.data values. The lengths can be mismatched.
     * @function module:data#morph
     * @param tgtArr {array | dtm.data}
     * @param [morphIdx=0.5] {number} between 0-1
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    morph: function (tgtArr, morphIdx, interp) {
        if (isNumDtmArray(tgtArr)) {
            tgtArr = tgtArr.val;
        }

        // TODO: accept array for multi-point morphing
        if (isNumDtmArray(morphIdx)) {
            morphIdx = morphIdx.get(0);
        } else if (!isNumber(morphIdx)) {
            morphIdx = 0.5;
        }

        morphIdx = 1 - Math.abs(mod(morphIdx, 2) - 1);

        if (!isString(interp)) {
            interp = 'linear';
        }

        if (isNumDtmArray(this) && isNumOrFloat32Array(tgtArr)) {
            this.set(dtm.transform.morph(this.val, tgtArr, morphIdx, interp));
        }

        return this;
    }
});

/* blocking operations */
dtm.data.augment({
    aliases: {
        // unblock: ['ub', 'u', 'ungroup', 'ug', 'flatten'],
        window: ['win'],
        transp: ['t']
    },

    // unblock: function () {
    //     if (isNestedDtmArray(this)) {
    //         var flattened = [];
    //         for (var i = 0, l = this.val.length; i < l; i++) {
    //             if (isDtmArray(this.val[i])) {
    //                 flattened = concat(flattened, this.val[i].val);
    //             }
    //         }
    //
    //         if (isNumArray(flattened)) {
    //             flattened = toFloat32Array(flattened);
    //         }
    //
    //         this.params.depth--;
    //         if (this.params.depth === 1) {
    //             this.params.nested = false;
    //         }
    //
    //         return this.set(flattened);
    //     } else {
    //         return this;
    //     }
    // },

    // TODO: array.block (and window) should transform the parent array into nested child array
    nest: function () {
        if (!isDtmArray(this.val)) {
            this.set([dtm.this(this.val)]);
            this.val[0].parent(this);
        }
        return this;
    },

    /**
     * Applies a window function to the array. May be combined with array.block() operation.
     * @function module:data#window
     * @param type
     * @returns {dtm.data}
     */
    window: function (type) {
        if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.window(type);
            });
        } else {
            return this.set(dtm.transform.window(this.val, type));
        }
    },

    ola: function (hop) {
        if (!isInteger(hop) || hop < 1) {
            hop = 1;
        }

        if (isNestedDtmArray(this)) {
            var len = hop * (this.length-1) + this.val[0].get('len');
            var newArr = new Array(len);
            newArr.fill(0);
            this.val.forEach(function (a, i) {
                a.foreach(function (v, j) {
                    newArr[i*hop+j] += v.get();
                });
            });

            return this.set(newArr);
        } else {
            return this;
        }
    },

    copy: function (times) {
        if (!isInteger(times)) {
            times = 1;
        }
        if (!isNestedDtmArray(this)) {
            var res = [];
            for (var i = 0; i < times; i++) {
                res.push(this.val);
            }
            return dtm.data(res);
        } else {

        }
        return this;
    },

    // TODO: conflicts with gen.transpose()
    transp: function () {
        if (isNestedDtmArray(this)) {
            var newArray = [];
            var i = 0;
            while (this.val.some(function (a) {
                return i < a.get('len');
            })) {
                // TODO: get('row', i)
                newArray.push(this.get('row', i));
                i++;
            }
            return this.set(newArray);
        } else {
            return this.block(1);
        }
    },

    // not sure what this does
    seg: function (idx) {
        if (isNumArray(idx) || isNumDtmArray(idx)) {
            var res = [];
            var len = idx.length;
            if (isNumDtmArray(idx)) {
                idx = idx.get();
            }

            if (idx[0] !== 0) {
                if (isFloat32Array(this.val)) {
                    res.push(dtm.data(this.val.subarray(0, idx[0])).label('0'));
                } else {
                    res.push(dtm.data(this.val.slice(0, idx[0])).label('0'));
                }
            }

            for (var i = 0; i < len-1; i++) {
                if (isFloat32Array(this.val)) {
                    res.push(dtm.data(this.val.subarray(idx[i], idx[i+1])).label(idx[i].toString()));
                } else {
                    res.push(dtm.data(this.val.slice(idx[i], idx[i+1])).label(idx[i].toString()));
                }
            }

            if (isFloat32Array(this.val)) {
                res.push(dtm.data(this.val.subarray(idx[i], this.length)).label(idx[i].toString()));
            } else {
                res.push(dtm.data(this.val.slice(idx[i], this.length)).label(idx[i].toString()));
            }

            return this.set(res);
        } else if (isInteger(idx)) {
            return this;
        }

        return this;
    }
});

/* transforms and modulations */
dtm.data.augment({
    aliases: {
        amp: ['am', 'gain'],
        freq: ['fm']
    },

    amp: function (input) {
        var ampArr;

        if (argsAreSingleVals(arguments)) {
            ampArr = argsToArray(arguments);
        } else if (isNumOrFloat32Array(input)) {
            ampArr = input;
        } else if (isNumDtmArray(input)) {
            ampArr = input.get();
        }

        return this.mult(ampArr);
    },

    // with support for fractional freq array with table lookup and angular velocity
    freq: function (input) {
        var freqArr;

        if (argsAreSingleVals(arguments)) {
            freqArr = argsToArray(arguments);
        } else if (isNumOrFloat32Array(input)) {
            freqArr = input;
        } else if (isNumDtmArray(input)) {
            freqArr = input.get();
        }

        var res = [];

        var phase = 0;
        var len;
        var wavetable = this.clone();

        if (freqArr.length > this.length) {
            wavetable.fit(freqArr.length, 'step');
            len = freqArr.length;
        } else {
            len = wavetable.length;
        }

        var currFreqVal = 1;
        var floor, ceil, frac;

        var line = dtm.line(len).get();
        var p;

        for (var i = 0; i < len; i++) {
            p = line[i];

            currFreqVal = freqArr[Math.floor(p * freqArr.length)];
            if (currFreqVal < 0) {
                phase += 1/len * currFreqVal;
                phase = mod(phase, 1);
            }

            floor = Math.floor(phase * (len-1));
            ceil = floor + 1;
            // ceil = currFreqVal >= 0 ? floor + 1 : floor - 1;
            // ceil = mod(ceil, len);
            frac = phase * (len-1) - floor;

            res.push(wavetable.val[floor] * (1-frac) + wavetable.val[ceil] * frac);

            if (currFreqVal >= 0) {
                phase += 1/len * currFreqVal;
                phase = mod(phase, 1);
            }
        }

        return this.set(res);
    }
});

/* arithmetic */
dtm.data.augment({
    aliases: {
        divide: ['div'],
        reciprocal: ['recip'],
        power: ['pow', 'exp'],
        abs: ['fwr'],
        round: ['q'],
        modulo: ['mod'],
        morethan: ['mt'],
        lessthan: ['lt']
    },

    /**
     * Adds a value to all the array elements.
     * @function module:data#add
     * @param factor {number|array|dtm.data}
     * @param [interp='step'] {string}
     * @returns {dtm.data}
     * @example
     * <div> hey </div>
     */
    add: function (factor, interp) {
        var that = this;
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.add(factor.get('next'));
                } else {
                    return a.add(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(that.get());
                });
                that.set(newArr);
                return that.map(function (a) {
                    return a.add(factor.get('next'));
                });
            }

            return that.set(dtm.transform.add(that.val, factor, interp));
        }
    },

    subtract: function (factor, interp) {
        var that = this;
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.add(factor.get('next'));
                } else {
                    return a.add(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(that.get());
                });
                that.set(newArr);
                return that.map(function (a) {
                    return a.add(factor.get('next'));
                });
            }

            return that.set(dtm.transform.subtract(that.val, factor, interp));
        }
    },

    /**
     * Scales the numerical array contents.
     * @function module:data#mult
     * @param factor {number|array|dtm.data}
     * @param [interp='step'] {string}
     * @returns {dtm.data}
     */
    mult: function (factor, interp) {
        var that = this;
        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.mult(factor.get('next'));
                } else {
                    return a.mult(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(that.get());
                });
                that.set(newArr);
                return that.map(function (a) {
                    return a.mult(factor.get('next'));
                });
            }

            return that.set(dtm.transform.mult(that.val, factor, interp));
        }
    },

    divide: function (factor, interp) {
        var that = this;

        if (!isString(interp)) {
            interp = 'step';
        }
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                if (isNestedNumDtmArray(factor)) {
                    return a.divide(factor.get('next'));
                } else {
                    return a.divide(factor);
                }
            });
        } else {
            if (isNumDtmArray(factor)) {
                factor = factor.get();
            } else if (isNestedNumDtmArray(factor)) {
                var newArr = [];
                factor.forEach(function () {
                    newArr.push(that.get());
                });
                that.set(newArr);
                return that.map(function (a) {
                    return a.divide(factor.get('next'));
                });
            }

            return that.set(dtm.transform.div(that.val, factor, interp));
        }
    },

    reciprocal: function (numerator) {
        if (isEmpty(numerator)) {
            numerator = 1;
        }
        var that = this;
        if (isNestedNumDtmArray(that)) {
            return that.map(function (a) {
                return a.reciprocal();
            });
        } else if (isNumDtmArray(that)) {
            return that.map(function (d) {
                return numerator/d.get(0);
            });
        } else {
            return that;
        }
    },

    /**
     * @function module:data#pow
     * @param factor {number|array|dtm.data}
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    power: function (factor, interp) {
        if (isNumDtmArray(factor)) {
            factor = factor.get();
        }
        return this.set(dtm.transform.pow(this.val, factor, interp));
    },

    /**
     * Applies the array contents as the power to the argument as the base
     * @function module:data#powof
     * @param factor {number|array|dtm.data}
     * @param [interp='linear'] {string}
     * @returns {dtm.data}
     */
    powof: function (factor, interp) {
        if (isNumDtmArray(factor)) {
            factor = factor.get();
        }
        return this.set(dtm.transform.powof(this.val, factor, interp));
    },

    log: function (base, interp) {
        if (isNumDtmArray(base)) {
            base = base.get();
        }
        return this.set(dtm.transform.log(this.val, base, interp));
    },

    /**
     * Rounds float values of the array to integer values.
     * @function module:data#round
     * @param to {number}
     * @returns {dtm.data}
     */
    round: function (to) {
        return mapNested(this, arguments) || this.set(dtm.transform.round(this.val, to));
    },

    /**
     * Quantizes float numbers to integer by flooring.
     * @function module:data#floor
     * @returns {dtm.data}
     */
    floor: function () {
        return mapNested(this, arguments) || this.set(dtm.transform.floor(this.val));
    },

    /**
     * Quantizes float numbers to integer by ceiling.
     * @function module:data#ceil
     * @returns {dtm.data}
     */
    ceil: function () {
        return mapNested(this, arguments) || this.set(dtm.transform.ceil(this.val));
    },

    /**
     * Full-wave rectify the values, returning absolute values.
     * @function module:data#fwr | abs
     * @returns {dtm.data}
     */
    abs: function () {
        return mapNested(this, arguments) || this.set(dtm.transform.fwr(this.val));
    },

    /**
     * Half-wave rectify the values, modifying all negative values to 0.
     * @function module:data#hwr
     * @returns {dtm.data}
     */
    hwr: function () {
        return mapNested(this, arguments) || this.set(dtm.transform.hwr(this.val));
    },

    modulo: function (divisor) {
        return mapNested(this, arguments) || this.set(dtm.transform.mod(this.val, divisor));
    },

    morethan: function (val) {
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                a.morethan(val);
            });
        } else {
            this.map(function (v) {
                return v.get(0) > val ? 1 : 0;
            });
        }
        return this;
    },

    mtet: function (val) {
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                a.mtet(val);
            });
        } else {
            this.filter(function (v) {
                return v >= val;
            });
        }
        return this;
    },

    lessthan: function (val) {
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                a.lessthan(val);
            });
        } else {
            this.filter(function (v) {
                return v < val;
            });
        }
        return this;
    },

    ltet: function (val) {
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                a.ltet(val);
            });
        } else {
            this.filter(function (v) {
                return v <= val;
            });
        }
        return this;
    },

    is: function (target) {
        if (this.length === 1 && target.length === 1) {

        }
    },

    isnt: function () {

    },

    has: function () {
        var that = this;
        var args = argsToArray(arguments);
        var target = dtm.data(args).flatten();
        var res = false;
        target.each(function (d) {
            res = that.some(function (v) {
                return v === d.get(0);
            }) ? true : res;
        });

        return res;
    }
});

/* statistics and aggregates */
dtm.data.augment({
    aliases: {
        mean: ['avg'],
        midrange: ['mid'],
        accumulate: ['accum', 'cuml', 'cum']
    },

    min: function (fn) {
        if (isFunction(fn)) {
            var res = getMin(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.min();
                });
            } else {
                return this.set(getMin(this.val));
            }
        }
    },

    max: function (fn) {
        if (isFunction(fn)) {
            var res = getMax(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.max();
                });
            } else {
                return this.set(getMax(this.val));
            }
        }
    },

    extent: function () {
        if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.set(a.get('extent'));
            });
        } else {
            return this.set(this.get('extent'));
        }
    },

    mean: function (fn) {
        if (isFunction(fn)) {
            var res = mean(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.mean();
                });
            } else {
                return this.set(mean(this.val));
            }
        }
    },

    mode: function (fn) {
        if (isFunction(fn)) {
            var res = mode(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.mode();
                });
            } else {
                return this.set(mode(this.val));
            }
        }
    },

    median: function (fn) {
        if (isFunction(fn)) {
            var res = median(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.median();
                });
            } else {
                return this.set(median(this.val));
            }
        }
    },

    midrange: function (fn) {
        if (isFunction(fn)) {
            var res = midrange(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.midrange();
                });
            } else {
                return this.set(midrange(this.val));
            }
        }
    },

    centroid: function (fn) {
        if (isFunction(fn)) {
            var res = centroid(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.centroid();
                });
            } else {
                return this.set(centroid(this.val));
            }
        }
    },

    std: function (fn) {
        if (isFunction(fn)) {
            var res = std(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.std();
                });
            } else {
                return this.set(std(this.val));
            }
        }
    },

    pstd: function (fn) {
        if (isFunction(fn)) {
            var res = pstd(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.pstd();
                });
            } else {
                return this.set(pstd(this.val));
            }
        }
    },

    'var': function (fn) {
        if (isFunction(fn)) {
            var res = variance(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.var();
                });
            } else {
                return this.set(variance(this.val));
            }
        }
    },

    pvar: function (fn) {
        if (isFunction(fn)) {
            var res = pvar(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.pvar();
                });
            } else {
                return this.set(pvar(this.val));
            }
        }
    },

    rms: function (fn) {
        if (isFunction(fn)) {
            var res = rms(this.val.map(function (v) {
                return fn(v);
            }));

            if (isNestedDtmArray(this)) {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            } else {
                return this.filter(function (v) {
                    return fn(v) === res;
                });
            }
        } else {
            if (isNestedDtmArray(this)) {
                return this.map(function (a) {
                    return a.rms();
                });
            } else {
                return this.set(rms(this.val));
            }
        }
    },

    // TODO: not consistent with other stats-based conversions
    sum: function () {
        if (isNestedDtmArray(this)) {
            var maxLen = 0;
            this.each(function (d) {
                if (d.length > maxLen) {
                    maxLen = d.length;
                }
            });

            var res = new Float32Array(maxLen);

            for (var i = 0; i < maxLen; i++) {
                this.each(function (d) {
                    if (i < d.length && isNumber(d.get(i))) {
                        res[i] += d.get(i);
                    }
                });
            }

            this.params.depth--;
            if (this.params.depth === 1) {
                this.params.nested = false;
            }

            return this.set(res);
        } else {
            var sum = this.val.reduce(function (a, b) {
                return a + b;
            });
            return this.set(sum);
        }
    },

    accumulate: function () {
        var a = 0;
        this.map(function (d) {
            a += d.get(0);
            return a;
        });

        return this;
    }
});

/* analysis, transformation and filtering */
dtm.data.augment({
    aliases: {
        correlation: ['corr'],
        covariance: ['covar', 'cov']
    },

    /**
     * @function module:data#diff
     * @returns {dtm.data}
     */
    diff: function (order, pad) {
        if (!isInteger(order) || order < 1) {
            order = 1;
        }
        for (var i = 0; i < order; i++) {
            this.val = dtm.transform.diff(this.val);
        }

        if (isSingleVal(pad)) {
            for (var i = 0; i < order; i++) {
                this.val = concat(this.val, pad);
            }
        }
        return this.set(this.val);
    },

    /**
     * Calculates the mean-square-error. If no argument is given, it will take the current array state as the modified value, and calculates the distortion from the original (initial state) value of itself. This would be useful for choosing quantization or transformation methods with less distortion to the data.
     * @returns {dtm.data}
     */
    mse: function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(array)) {
                var source = this.clone().reset();

                // respect the original length
                if (source.get('len') !== this.get('len')) {
                    this.fit(source.get('len'), 'step');
                }

                return source().subtract(this).pow(2).sum().divide(source.get('len'));
            }
        } else {
            return this;
        }
    },

    snr: function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(this)) {
                var mse = this.clone().mse();
                return this.set(meanSquare(this.val) / mse.get(0));
            }
        }
        return this;
    },

    dbsnr: function () {
        if (arguments.length === 0) {
            if (!isNestedDtmArray(this)) {
                var snr = this.snr();
                return this.set(10 * Math.log10(snr.get(0)));
            }
        }
        return this;
    },

    dct: function () {
        var that = this;
        if (isNumDtmArray(that)) {
            var res = [];
            var w;
            for (var k = 0; k < that.length; k++) {
                if (k === 0) {
                    w = Math.sqrt(1/(4*that.length));
                } else {
                    w = Math.sqrt(1/(2*that.length));
                }
                res.push(2 * w * sum(that.val.map(function (v, n) {
                        return v * Math.cos(Math.PI/that.length * (n + 0.5) * k);
                    })));
            }
            return that.set(res);
        } else if (isNestedDtmArray(that)) {
            return that.map(function (a) {
                return a.dct();
            });
        }
        return that;
    },

    idct: function () {
        var that = this;
        if (isNumDtmArray(that)) {
            var res = [];
            for (var k = 0; k < that.length; k++) {
                res.push(sum(that.val.map(function (v, n) {
                    if (n === 0) {
                        return v / Math.sqrt(that.length);
                    } else {
                        return Math.sqrt(2/that.length) * v * Math.cos(Math.PI/that.length * n * (k + 0.5));
                    }
                })));
            }
            return that.set(res);
        } else if (isNestedDtmArray(that)) {
            return that.map(function (a) {
                return a.idct();
            });
        }
        return that;
    },

    fir: function (coef) {
        var that = this;
        var coef_ = [];
        if (argsAreSingleVals(arguments)) {
            coef_ = argsToArray(arguments);
        } else if (isNumOrFloat32Array(coef)) {
            coef_ = coef;
        } else if (isNumDtmArray(coef)) {
            coef_ = coef.get();
        }
        var res = [];

        for (var n = 0; n < that.length; n++) {
            res[n] = 0;
            coef_.forEach(function (v, i) {
                res[n] += (n-i) >= 0 ? v * that.val[n-i] : 0;
            });
        }

        return that.set(res);
    },

    amdf: function (max) {
        if (!isNumber(max)) {
            max = Math.round(this.length / 2);
        }

        var res = [];

        for (var i = 1; i < max; i++) {
            res.push(this().subtract(this().shift(i)).abs().mean().get(0));
        }

        return this.set(res);
    },

    correlation: function (tgt, normalize) {
        if (isNumDtmArray(this)) {
            var res = dtm.data();
            var zeros = dtm.data(0).rep(this.get('len'));
            var src = this.clone();
            var denom = 1;

            if (normalize === true) {
                denom = src.get('std') * tgt.get('std') * (src.length-1);
            } else if (tgt === true && isEmpty(normalize)) {
                denom = Math.pow(src.get('std'), 2) * (src.length-1);
            }

            if (isNumDtmArray(tgt) || isNumOrFloat32Array(tgt)) {
                var tgtLen = isNumOrFloat32Array(tgt) ? tgt.length : tgt.get('len');
                tgt = zeros().append(tgt).append(zeros);
                src.append(dtm.const(0).size(tgtLen)).append(zeros);
            } else {
                tgt = zeros().append(src).append(zeros);
                src.append(zeros).append(zeros);
            }

            for (var i = 0; i < src.get('len') - (this.get('len')-1); i++) {
                res.append(src().mult(tgt).div(denom).get('sum'));
                src.shift(-1);
            }

            return res;
        } else {
            return this;
        }
    },

    covariance: function (tgt, normalize) {
        if (isNumDtmArray(this)) {
            if (isNumDtmArray(tgt)) {
                tgt = tgt.clone();
            } else if (isNumOrFloat32Array(tgt)) {
                tgt = dtm.data(tgt);
            } else {
                tgt = this.clone();
            }

            var len = this.get('len');

            if (tgt.get('len') !== len) {
                tgt.fit(len, 'step');
            }

            var xEst = this.get('mean');
            var yEst = tgt.get('mean');

            var res = 0;

            for (var i = 0; i < len; i++) {
                res += (this.get(i) - xEst) * (tgt.get(i) - yEst);
            }

            res /= len;

            if (normalize === true || (tgt === true && isEmpty(normalize))) {
                res /= (this.get('std') * tgt.get('std'));
            }

            return this.set(res);
        } else {
            return this;
        }
    },

    linreg: function () {
        if (isNumDtmArray(this)) {
            var xEst = dtm.range(this.get('len')).get('mean');
            var yEst = this.get('mean');
            var SSxy = 0;
            var SSxx = 0;

            this.val.forEach(function (y, x) {
                SSxy += (x - xEst) * (y - yEst);
                SSxx += Math.pow((x - xEst), 2);
            });
            var b1 = SSxy / SSxx;
            var b0 = yEst - b1 * xEst;

            var est = [];
            var err = [];
            for (var i = 0; i < this.get('len'); i++) {
                est.push(b0 + b1 * i);
                err.push(this.get(i) - est[i]);
            }

            return this.set([est, err, [b1, b0]]);
        } else if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.linreg();
            });
        } else {
            return this;
        }
    }
});

/* nominal */
dtm.data.augment({
    aliases: {
        histogram: ['histo'],
        distribution: ['dist'],
        invert: ['inv'],
        unique: ['uniq'],
        classify: ['class']
    },

    // TODO: copy-paste the count function
    /**
     * Generates a histogram from a nominal array, such as the string type.
     * @function module:data#histogram
     * @returns {dtm.data}
     */
    histogram: function () {
        // CHECK: this is hacky
        this.params.type = 'string'; // re-set the type to string from number
        return this.set(toFloat32Array(histo(this.val)));
    },

    count: function () {
        var that = this;
        var res = [];
        objForEach(countOccurrences(that.get()), function (v, k) {
            res.push(dtm.data(v).label(k).parent(that));
        });
        return that.set(res);
    },

    mapcount: function () {
        var count = this().count();
        return this.map(function (d) {
            return count(d);
        });
    },

    /**
     * Distribution of each symbol (unique value)
     * @returns {dtm.data}
     */
    distribution: function (qdelta) {
        if (!isNestedDtmArray(this)) {
            var hist = qdelta ? this().round(qdelta).count() : this().count();
            var res = hist().mult(hist().flatten().sum().recip()).sortby(function (d) {
                return d.get('key');
            });
            return this.set(res.val);
        } else {
            return this;
        }
    },

    mapdist: function (qdelta) {
        var dist = this().distribution(qdelta);
        return this.map(function (d) {
            return dist(d);
        });
    },

    pmf: function (range, qdelta) {
        var min, max;

        if (isEmpty(range)) {
            min = 0;
            max = 1;
        }

        if (isEmpty(qdelta)) {
            qdelta = (max - min) / (this.length - 1);
        }

        var dist = this().round(qdelta).dist();
        dtm.line();

        return this;
    },

    /**
     * Cumulative distribution function
     * @returns {cdf}
     */
    cdf: function () {
        var dist = this().dist();
        var res = [];

        dtm.range(dist.length).each(function (d, i) {
            res.push(dist(dtm.range(i+1)).flatten().sum().key(dist(i).get('key')))
        });

        return this.set(res);
    },

    invert: function () {
        // assuming "this" is a normalized CDF
        var that = this;
        var res = that().map(function (d, i) {
            return that().ltet(i/(that.length)).length / that.length;
        });

        return this.set(res.val);
    },

    icdf: function () {
        return this.accum().range(0, 1).invert();
    },

    entropy: function (normalize) {
        var base = 2;

        if (isNestedDtmArray(this)) {
            return this.map(function (a) {
                return a.entropy();
            })
        } else {
            var dist = this.dist().unblock();

            if (normalize === true) {
                base = dist.length;
            }

            if (dist.length === 1) {
                return this.set(0);
            } else {
                return dist.map(function (d) {
                    return d.mult(d().log(base));
                }).sum().mult(-1);
            }
        }
    },

    /**
     * Overwrites the contents with unsorted unique values of the array.
     * @function module:data#uniq | unique
     * @returns {dtm.data}
     */
    unique: function () {
        return this.set(dtm.transform.unique(this.val));
    },

    // TODO: id by occurrence / rarity, etc.
    /**
     * @function module:data#classify
     * @param by
     * @returns {dtm.data}
     */
    classify: function (by) {
        return this.set(dtm.transform.classId(this.val));
    }
});

/* random */
dtm.data.augment({
    aliases: {
        shuffle: ['randomize'],
        randomtrigger: ['randtrig']
    },

    /**
     * Randomizes the order of the array.
     * @function module:data#shuffle | random | randomize | rand
     * @returns {dtm.data}
     */
    shuffle: function () {
        return this.set(dtm.transform.shuffle(this.val));
    },

    randomtrigger: function (dist) {
        if (!isString(dist)) {
            dist = 'uniform';
        }

        if (isNestedNumDtmArray(this)) {
            return this.map(function (a) {
                return a.randomtrigger();
            });
        } else if (isNumDtmArray(this)) {
            return this.map(function (v) {
                if (Math.random() <= v) {
                    return 1.0;
                } else {
                    return 0.0;
                }
            });
        } else {
            return this;
        }
    }
});

/* unit conversions */
dtm.data.augment({
    aliases: {
        notesToBeats: ['ntob'],
        beatsToNotes: ['bton'],
        intervalsToBeats: ['itob'],
        beatsToIntervals: ['btoi'],
        intervalsToOffsets: ['itoo'],
        offsetsToIntervals: ['otoi'],
        beatsToTime: ['btot'],
        timeToBeats: ['ttob'],
        tonumber: ['tonum', 'num'],
        stringify: ['tostring'],
        toFloat32: ['tofloat32', 'tf32']
    },

    mtof: function () {
        return this.set(dtm.transform.mtof(this.val));
    },

    ftom: function () {
        return this.set(dtm.transform.ftom(this.val));
    },

    freqtomel: function () {
        return this.div(700).add(1).log(10).mult(2595);
    },

    meltofreq: function () {
        return this.div(2595).powof(10).add(-1).mult(700);
    },

    /**
     * Converts note values into a beat sequence.
     * @function module:data#notesToBeats | ntob
     * @param [resolution=4] {number}
     * @returns {dtm.data}
     */
    notesToBeats: function (resolution) {
        resolution = resolution || 4;
        return this.set(dtm.transform.notesToBeats(this.val, resolution));
    },

    /**
     * Converts beat sequence into note values.
     * @function module:data#beatsToNotes | bton
     * @param [resolution=4] {number}
     * @returns {dtm.data}
     */
    beatsToNotes: function (resolution) {
        resolution = resolution || 4;
        return this.set(dtm.transform.beatsToNotes(this.val, resolution));
    },

    /**
     * Converts intervalic values into a beat sequence.
     * @function module:data#intervalsToBeats | itob
     * @returns {dtm.data}
     */
    intervalsToBeats: function (arr) {
        var ampseq;

        if (isNumDtmArray(arr)) {
            ampseq = arr.val;
        } else if (isNumOrFloat32Array(arr)) {
            ampseq = arr;
        }
        return this.set(dtm.transform.intervalsToBeats(this.val, ampseq));
    },

    /**
     * Converts beat sequence into intervalic values.
     * @function module:data#beatsToIntervals | btoi
     * @returns {dtm.data}
     */
    beatsToIntervals: function () {
        return this.set(dtm.transform.beatsToIntervals(this.val));
    },

    intervalsToOffsets: function () {
        if (isNumDtmArray(this)) {
            var that = this;
            var currentOffset = 0;
            var res = [];
            res.push(currentOffset);

            that.val.forEach(function (v, i) {
                // ignore the last interval value
                if (i !== that.length-2) {
                    currentOffset += v;
                    res.push(currentOffset);
                }
            });

            return that.set(res);
        } else {
            return this;
        }
    },

    /**
     * Converts time offset sequence (e.g., [0, 0.5, 1, etc.], usually in seconds) to intervallic sequence that may signify note durations. Since we don't have the information about the duration of the very last note, it is copied from the one before that.
     * @returns {offsetsToIntervals}
     */
    offsetsToIntervals: function () {
        if (isNumDtmArray(this)) {
            var that = this;
            var res = [];

            for (var i = that.length-1; i > 0; i--) {
                res.unshift(that.get(i) - that.get(i-1));
            }

            res.push(res[res.length-1]);

            return that.set(res);
        } else {
            return this;
        }
    },

    /**
     * Converts beat sequence into an array of indices (or delays or onset-coordinate vectors.) Useful for creating time delay-based events.
     * @function module:data#beatsToTime
     * @returns {dtm.data}
     */
    beatsToTime: function () {
        return this.set(dtm.transform.beatsToIndices(this.val));
    },

    /**
     * function module:data#timeToBeats
     * @param [len]
     * @returns {dtm.data}
     */
    timeToBeats: function (len) {
        return this.set(dtm.transform.indicesToBeats(this.val, len));
    },

    /**
     * Converts string or boolean values to numerical values.
     * @function module:data#tonumber | toNumber
     * @returns {dtm.data}
     */
    tonumber: function () {
        if (isParsableNumArray(this.val) || isBoolArray(this.val)) {
            return this.set(toFloat32Array(dtm.transform.tonumber(this.val)));
        } else {
            return this;
        }
    },

    /**
     * Converts the array values (such as numbers) into string format.
     * @function module:data#stringify | tostring
     * @returns {dtm.data}
     */
    stringify: function () {
        return this.set(dtm.transform.stringify(this.val));
    },

    toFloat32: function () {
        if (isNumArray(this.val)) {
            this.set(toFloat32Array(this.val));
        }
        return this;
    }
});

/* JS list operation wrappers and variations */
dtm.data.augment({
    aliases: {
        prepend: ['prep'],
        concat: ['cat', 'append', 'app'],
        repeat: ['rep'],
        fitrepeat: ['fitrep', 'frep'],
        mirror: ['mirr', 'mir'],
        reverse: ['rev'],
        queue: ['fifo'],
        select: ['sel'],
        order: ['reorder']
    },

    reduce: function (fn) {
        return this.set(this.val.reduce(fn));
    },

    // TODO: these should be in the get method
    some: function (fn) {
        return this.val.some(fn);
    },

    every: function (fn) {
        return !isEmpty(this.val.every) ? this.val.every(fn) : false;
    },

    filter: function (fn) {
        return this.set(this.val.filter(fn));
    },

    // TODO: nested array and concat?
    /**
     * Concatenates new values to the contents.
     * @function module:data#concat | append
     * @param arr {array | dtm.data} A regular array or a dtm.data object.
     * @returns {dtm.data}
     */
    concat: function (arr) {
        if (isEmpty(arr)) {
            arr = [];
        }

        if (isDtmArray(arr)) {
            this.val = concat(this.val, arr.get());
        } else {
            this.val = concat(this.val, arr);
        }
        return this.set(this.val);
    },

    prepend: function (arr) {
        if (isEmpty(arr)) {
            arr = [];
        }

        if (isDtmArray(arr)) {
            this.val = concat(arr.get(), this.val);
        } else {
            this.val = concat(arr, this.val);
        }
        return this.set(this.val);
    },

    /**
     * Repeats the contents of the current array.
     * @function module:data#repeat | rep
     * @param count {number} Integer
     * @returns {dtm.data}
     */
    repeat: function (count) {
        if (isDtmArray(count) && count.get('len') === 1) {
            count = count.get(0);
        }

        if (!isInteger(count)) {
            count = 1;
        }

        return this.set(dtm.transform.repeat(this.val, count));
    },

    fitrepeat: function (count, interp) {
        if (isDtmArray(count) && count.get('len') === 1) {
            count = count.get(0);
        }

        if (!isInteger(count)) {
            count = 1;
        }

        if (!isString(interp)) {
            interp = 'step';
        }

        return this.set(dtm.transform.fit(dtm.transform.repeat(this.val, count), this.length, interp));
    },

    /**
     * @function module:data#pad
     * @param val
     * @param length
     * @returns {{type: string}}
     */
    pad: function (val, length) {
        var test = [];
        for (var i = 0; i < length; i++) {
            test.push(val);
        }

        return this.concat(test);
    },

    /**
     * Truncates some values either at the end or both at the beginning and the end.
     * @function module:data#truncate
     * @param arg1 {number} Start bits to truncate. If the arg2 is not present, it will be the end bits to truncate.
     * @param [arg2] {number} End bits to truncate.
     * @returns {dtm.data}
     */
    truncate: function (arg1, arg2) {
        return array.set(dtm.transform.truncate(array.val, arg1, arg2));
    },

    remove: function (input) {
        var at = [];
        var val = this.val;

        if (argsAreSingleVals(arguments)) {
            if (isNumArray(argsToArray(arguments))) {
                at = argsToArray(arguments);
            }
        } else if (isNumOrFloat32Array(input)) {
            at = input;
        } else if (isNumDtmArray(input)) {
            at = input.get();
        }

        at.forEach(function (i) {
            val.splice(i, 1);
        });
        return this.set(val);
    },

    removeempty: function () {
        var newArr = [];
        if (isNestedDtmArray(this)) {
            this.forEach(function (a) {
                if (a.get(0).constructor.name === 'Float32Array') {
                    if (a.get(0).length > 0) {
                        newArr.push(a);
                    }
                } else {
                    newArr.push(a);
                }
            });
            return dtm.data(newArr);
        } else {
            this.forEach(function (v) {
                if (!isEmpty(v)) {
                    newArr.push(v);
                }
            });
            return dtm.data(newArr).label(this.get('name'));
        }
    },

    /**
     * Shifts the indexing position of the array by the amount.
     * @function module:data#shift
     * @param amount {number} Integer
     * @returns {dtm.data}
     */
    shift: function (amount) {
        return this.set(dtm.transform.shift(this.val, amount));
    },

    /**
     * Appends an reversed array at the tail.
     * @function module:data#mirror
     * @returns {{type: string}}
     */
    mirror: function () {
        return this.concat(dtm.transform.reverse(this.val));
    },

    /**
     * Flips the array contents horizontally.
     * @function module:data#reverse | rev
     * @returns {dtm.data}
     */
    reverse: function () {
        return this.set(dtm.transform.reverse(this.val));
    },

    /**
     * Flips the numerical values vertically at the given center point.
     * @function module:data#flip
     * @param [center=meanVal] {number}
     * @returns {dtm.data}
     */
    flip: function (center) {
        return this.set(dtm.transform.invert(this.val, center));
    },

    /**
     * Adds new value(s) at the end of the array, and removes the oldest value(s) at the beginning of the array. The size of the array is unchanged.
     * @function module:data#queue | fifo
     * @param input {number|array}
     * @returns {dtm.data}
     */
    queue: function (input) {
        if (isNumber(input)) {
            this.val.push(input);
            this.val.shift();
        } else if (isFloat32Array(input)) {
            this.val = Float32Concat(this.val, input);
            this.val = this.val.splice(input.length);
        } else if (isArray(input)) {
            if (isFloat32Array(this.val)) {
                this.val = Float32Concat(this.val, input);
                this.val = Float32Splice(this.val, 0, input.length);
            } else {
                this.val = this.val.concat(input);
                this.val = this.val.splice(input.length);
            }
        } else if (isDtmArray(input)) {
            this.val = this.val.concat(input.get());
            this.val = this.val.splice(input.get('len'));
        }
        return this.set(this.val);
    },

    find: function (tgt) {
        if (!isEmpty(tgt)) {
            var res = [];

            if (isFunction(tgt)) {
                this.each(function (d, i) {
                    if (tgt(d)) {
                        res.push(i);
                    }
                });
            } else if (isSingleVal(tgt)) {
                this.each(function (d, i) {
                    if (d.get(0) === tgt) {
                        res.push(i);
                    }
                });
            } else {
                return this;
            }

            return this.set(res);
        } else {
            return this;
        }
    },

    /**
     * Sorts the contents of numerical array.
     * @function module:data#sort
     * @returns {dtm.data}
     */
    sort: function (fn) {
        if (isEmpty(fn)) {
            return this.set(dtm.transform.sort(this.val));
        } else {
            return this.set(this.val.sort(fn));
        }
    },

    sortby: function (fn, desc) {
        if (!isBoolean(desc)) {
            desc = false;
        }
        if (!isFunction(fn)) {
            fn = function (v) {
                return v;
            };
        }
        var res = this.val.sort(function (a, b) {
            if (desc) {
                return fn(b) - fn(a);
            } else {
                return fn(a) - fn(b);
            }
        });
        return this.set(res);
    },

    replace: function (tgt, val) {
        // TODO: type and length check
        // TODO: if val is an array-ish, fill the tgt w/ the array elements
        if (isSingleVal(val)) {
            if (isSingleVal(tgt)) {
                return this.set(this.val.map(function (v) {
                    if (v === tgt) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isArray(tgt)) {
                return this.set(this.val.map(function (v) {
                    if (tgt.some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isDtmArray(tgt)) {
                return this.set(this.val.map(function (v) {
                    if (tgt.get().some(function (w) {
                            return w === v;
                        })) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            } else if (isFunction(tgt)) {
                return this.set(this.val.map(function (v) {
                    if (tgt(v)) {
                        return val;
                    } else {
                        return v;
                    }
                }));
            }
        } else {
            return this;
        }
    },

    // TODO: support typed array
    select: function () {
        var that = this;
        var indices, res = [];
        if (argsAreSingleVals(arguments)) {
            indices = argsToArray(arguments);
        } else if (isNumOrFloat32Array(arguments[0])) {
            indices = arguments[0];
        } else if (isDtmArray(arguments[0]) && isNumOrFloat32Array(arguments[0].get())) {
            indices = arguments[0].get();
        }

        if (!isNumOrFloat32Array(indices)) {
            return that;
        } else {
            indices.forEach(function (i) {
                res.push(that.val[mod(i, that.length)]);
            });
            return that.set(res);
        }
    },

    // TODO: may be obsolete
    reorder: function () {
        var indices;

        if (isDtmArray(arguments[0])) {
            indices = toFloat32Array(arguments[0]);
        } else if (argsAreSingleVals(arguments)) {
            indices = argsToArray(arguments);
        } else if (argIsSingleArray(arguments)) {
            indices = arguments[0];
        }

        if (isNumOrFloat32Array(indices)) {
            var newArr = new Array(indices.length);
            indices.forEach(function (v, i) {
                newArr[i] = this.get(v);
            });
        }
        return this.set(newArr);
    }
});

/* string operations */
dtm.data.augment({
    aliases: {},
    /**
     * Separates the array items into new array using the separator
     * @param [separator=''] {string}
     * @returns dtm.data
     */
    split: function (separator) {
        return this.set(dtm.transform.split(this.val, separator));
    },

    join: function (delimiter) {
        var that = this;
        if (isNestedDtmArray(that)) {
            that.map(function (a) {
                return a.join(delimiter);
            });
        }

        if (!isString(delimiter)) {
            delimiter = '';
        }
        var res = '';
        that.each(function (v, i) {
            res += toString(v.get(0));
            if (i < that.length-1) {
                res += delimiter;
            }
        });

        return that.set(res);
    },

    editdist: function (target) {
        if (isString(target)) {
            return this.set(dtm.transform.editDistance(this.val, target));
        } else {
            return this;
        }
    }
});

/* utilities */
dtm.data.augment({
    aliases: {
        call: ['do']
    },

    /* dtm.generator placeholders */
    // these are not really necessary, but prevents typeError when calling dtm.gen functions on pure dtm.data object
    type: function () { return this; },
    size: function () { return this; },

    call: function (fn) {
        if (isFunction(fn)) {
            if (arguments.length > 1) {
                // ?
            }
            fn(this);
        }
        return this;
    },

    process: function (fn) {
        this.params.processFn = fn;
        return this;
    },

    // TODO: these are broken...
    print: function () {
        if (isFunction(dtm.params.printer)) {
            dtm.params.printer.apply(this, [this].concat(argsToArray(arguments)));
        } else {
            dtm.util.print(this);
        }
        return this;
    },

    plot: function () {
        if (isFunction(dtm.params.plotter)) {
            dtm.params.plotter.apply(this, [this].concat(argsToArray(arguments)));
        }
        return this;
    }
});

/* quantization and non-linear scaling */
dtm.data.augment({
    aliases: {
        pitchquantize: ['pq']
    },

    /**
     * Pitch quantize the array values. Shorthand: data.pq
     * @function module:data#pitchquantize
     * @param scale {array|dtm.data} A numerical or string (solfa -- e.g., 'do' or 'd' instead of 0) denoting the musical scale degrees.
     * @returns {dtm.data}
     */
    pitchquantize: function (scale) {
        if (isNestedDtmArray(this)) {
            return this.map(function (d) {
                return d.pitchquantize(scale);
            });
        }

        if (isEmpty(scale)) {
            scale = dtm.gen('range', 12).get();
        } else if (argsAreSingleVals(arguments)) {
            scale = argsToArray(arguments);
        } else if (isDtmArray(scale) && isNumOrFloat32Array(scale.get())) {
            scale = scale.get();
        } else if (isNumOrFloat32Array(scale)) {

        }

        return this.set(dtm.transform.pitchQuantize(this.val, scale));
    }
});

dtm.data.augment({
    note: function () {
        var args = argsToArray(arguments);
        return this.freq(dtm.data(args).flatten().mtof());
    }
});

/* contributions */
dtm.data.augment({
    /**
     * Interleaves two arrays
     * @param arrIn {dtm.array}
     * @param [depth1=1] {number} Must be an integer
     * @param [depth2=1] {number} Must be an integer
     * @returns {dtm.array}
     * @author Ben Taylor
     */
    interleave: function (arrIn, depth1, depth2) {
        var d1 = depth1 || 1;
        var d2 = depth2 || 1;

        var result = [];
        var newlength = Math.max(this.length, arrIn.length) * (d1 + d2);
        var index1 = 0, index2 = 0;
        var val = 0, j = 0;
        for (var i = 0; i < newlength; i++) {
            for (j = 0; j < d1; j++) {
                val = this.get(index1 % this.length);
                index1++;
                result.push(val);
            }
            for (j = 0; j < d2; j++) {
                val = arrIn.get(index2 % arrIn.length);
                index2++;
                result.push(val);
            }
        }
        return this.set(result);
    }
});
/**
 * @fileOverview A module for generating array object with certain shapes, extends the dtm.data module
 * @module generator
 */

/**
 * @function module:generator.generator
 * @returns {dtm.generator}
 */
dtm.generator = function () {
    var paramsExt = {
        type: null,
        min: 0.0,
        max: 1.0,

        start: 0.0,
        end: 1.0,
        interval: null,

        scale: undefined,
        transpose: 0,

        index: undefined,

        //step: 0.0,
        amp: 1.0,
        cycle: 1.0,
        phase: 0.0,
        const: 0.0,
        string: '',
        pack: false, // into dtm.data
        typed: true // Float32Array
    };

    // extend the dtm.data module
    var generator = dtm.data();

    var params = generator.meta.getParams();
    objForEach(paramsExt, function (val, key) {
        params[key] = val;
    });

    //generator.meta = {
    //    type: 'dtm.generator'
    //};

    // TODO: define params better
    // name, arg1, 2, 3, ..., length
    var tempParams = {
        oscil: {
            name: ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'invSaw', 'noise', 'square', 'sq', 'harm', 'harmonic'],
            args: ['amp', 'freq', 'phase'],
            len: 4096
        },
        envelope: {
            name: [],
            args: [],
            len: 512
        }
    };

    var types = {
        all: [
            'line', 'saw', 'rise',
            'decay', 'fall', 'invSaw',
            'adsr', 'ADSR',
            'seq', 'sequence', 'series',
            'range', 'r',
            'scale', 'chord',
            'modal', 'modes', 'mode',
            'fibonacci',
            'noise', 'random', 'rand', 'rf', 'randi', 'ri',
            'gauss', 'gaussian', 'gaussCurve', 'normal',
            'sin', 'sine', 'cos', 'cosine',
            'tri', 'triangle',
            'sig', 'sigmoid', 'logistic',
            'zeros', 'zeroes', 'ones',
            'constant', 'constants', 'const', 'consts',
            'repeat',
            'string', 'str', 's', 'text', 'split',
            'character', 'characters', 'chars', 'char', 'c'
        ],
        oscil: ['sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'invSaw', 'noise', 'square', 'sq', 'harm', 'harmonic'],
        const: ['zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts'],
        envelope: ['rise', 'decay', 'fall', 'ahr'],
        sequence: [],
        noLength: ['string', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'range', 'r', 'seq', 'scale', 'mode', 'chord', 'modal'],
        noRange: [],
        noMinMax: [],
        noMinMaxDir: ['rise', 'decay', 'fall', 'noise'],
        random: ['random', 'rand', 'rf', 'randi', 'ri'],
        string: ['string', 'split', 'str', 's', 'character', 'characters', 'chars', 'char', 'c', 'text']
    };

    function isTypeCategOf(type) {
        return types[type].indexOf(params.type) > -1;
    }

    function process() {
        function line(len, min, max, cycle) {
            var res = new Float32Array(len);
            var incr = (max - min) / (len-1);

            for (var i = 0; i < len; i++) {
                res[i] = min + incr * i;
            }

            return res;
        }

        // TODO: should use Float32Array

        function sin(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var phase = mod(i/(len-1) + offset / cycle, 1.0);
                var val = Math.sin(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        function cos(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var phase = mod(i/(len-1) + offset, 1.0);
                var val = Math.cos(Math.PI * 2.0 * phase * cycle) * amp;
                val = (val+1)/2 * (max - min) + min;
                res[i] = val;
            }

            return res;
        }

        // TODO: implement
        function square(len, min, max, amp, cycle, offset) {
            var res = new Float32Array(len);
            return res;
        }

        // TODO: implement
        function tri(len, min, max, amp, cycle, offset) {}

        function sig(len, steepness) {
            return dtm.line(len).range(-Math.E, Math.E).map(function (v) {
                return 1/(1+Math.pow(Math.E,(-v*steepness)));
            });
        }

        function random(len, min, max, amp, floor) {
            var res = new Float32Array(len);
            for (var i = 0; i < len; i++) {
                var val = Math.random() * (max - min) + min;
                if (floor) {
                    res[i] = Math.floor(val) * amp;
                } else {
                    res[i] = val * amp;
                }
            }
            return res;
        }

        function constant(len, val) {
            var res;
            if (isNumber(val)) {
                res = new Float32Array(len);
            } else {
                res = new Array(len);
            }
            for (var i = 0; i < len; i++) {
                if (isNumOrFloat32Array(val)) {
                    res[i] = toFloat32Array(val);
                } else if (isDtmArray(val)) {
                    res[i] = val.parent(generator);
                } else {
                    res[i] = val;
                }
            }
            return res;
        }

        // TODO: implement
        function series() {
            //return res;
        }

        // TODO: broekn
        function sequence(start, end, interval) {
            if (!isNumber(interval) && interval === 0.0) {
                interval = 1.0;
            }

            var steps = Math.floor((end - start) / interval) + 1;
            generator.length = steps;
            //console.log(steps);
            var res = new Float32Array();

            for (var i = 0; i < steps; i++) {
                res[i] = start + interval * i;
            }
            return res;
        }

        function range(start, end, interval) {
            if (!isNumber(interval) || interval === 0.0) {
                interval = 1.0;
            }

            if (end >= start) {
                interval = Math.abs(interval);
            } else {
                interval = -Math.abs(interval);
            }

            var len = Math.ceil(Math.abs(end - start) / Math.abs(interval));
            var res = new Float32Array(len);

            for (var i = 0; i < len; i++) {
                res[i] = start + i * interval;
            }

            return res;
        }

        function transposeScale(scale, factor) {
            var shifted = scale.map(function (v) {
                return mod(v + factor, 12);
            });

            return dtm.transform.sort(shifted);
        }

        function scale(name, transpose) {
            var res = [];

            var scales = {
                chromatic: {
                    names: ['chromatic', 'chr'],
                    values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                },
                major: {
                    names: ['major', 'maj', 'ionian'],
                    values: [0, 2, 4, 5, 7, 9, 11]
                },
                minor: {
                    names: ['minor', 'min', 'aeolian'],
                    values: [0, 2, 3, 5, 7, 8, 10]
                },
                wholetone: {
                    names: ['wholetone', 'whole', 'wt'],
                    values: [0, 2, 4, 6, 8, 10]
                },
                majpenta: {
                    names: ['penta', 'pent', 'majpenta'],
                    values: [0, 2, 4, 7, 9]
                },
                dorian: {
                    names: ['dorian'],
                    values: [0, 2, 3, 5, 7, 9, 10]
                },
                phrygian: {
                    names: ['phrygian', 'phry'],
                    values: [0, 1, 3, 5, 7, 8, 10]
                },
                lydian: {
                    names: ['lydian', 'lyd'],
                    values: [0, 2, 4, 6, 7, 9, 11]
                },
                mixolydian: {
                    names: ['mixolydian', 'mixo'],
                    values: [0, 2, 4, 5, 7, 9, 10]
                },
                locrian: {
                    names: ['locrian', 'loc'],
                    values: [0, 1, 3, 5, 6, 8, 10]
                }
            };

            objForEach(scales, function (v, k) {
                if (!isEmpty(name)) {
                    if (v.names.indexOf(name.toLowerCase()) !== -1) {
                        res = new Float32Array(transposeScale(v.values, transpose));
                    }
                } else {
                    res.push(dtm.data(v.values).label(k));
                }
            });

            return res ? res : new Float32Array();
        }

        function chord(name, transpose) {
            var chords = {
                major: {
                    names: ['major', 'maj'],
                    values: [0, 4, 7, 11, 14, 18, 21]
                }
            };
        }

        function modal(index) {
            var modes = {
                'dahina tabla': [1, 2.89, 4.95, 6.99, 8.01, 9.02],
                'bayan tabla': [1, 2.0, 3.01, 4.01, 4.69, 5.63],
                'red cedar wood plate': [1, 1.47, 2.09, 2.56],
                'redwood wood plate': [1, 1.47, 2.11, 2.57],
                'douglas fir wood plate': [1, 1.42, 2.11, 2.47],
                'uniform wooden bar': [1, 2.572, 4.644, 6.984, 9.723, 12],
                'uniform aluminum bar': [1, 2.756, 5.423, 8.988, 13.448, 18.680],
                'xylophone': [1, 3.932, 9.538, 16.688, 24.566, 31.147],
                'vibraphone 1': [1, 3.984, 10.668, 17.979, 23.679, 33.642],
                'vibraphone 2': [1, 3.997, 9.469, 15.566, 20.863, 29.440],
                'chalandi plates': [1, 1.72581, 5.80645, 7.41935, 13.91935],
                'tibetan bowl (180mm)': [1, 2.77828, 5.18099, 8.16289, 11.66063, 15.63801, 19.99],
                'tibetan bowl (152 mm)': [1, 2.66242, 4.83757, 7.51592, 10.64012, 14.21019, 18.14027],
                'tibetan bowl (140 mm)': [1, 2.76515, 5.12121, 7.80681, 10.78409],
                'wine glass': [1, 2.32, 4.25, 6.63, 9.38],
                'small handbell': [1, 1.0019054878049, 1.7936737804878, 1.8009908536585, 2.5201981707317, 2.5224085365854, 2.9907012195122, 2.9940548780488, 3.7855182926829, 3.8061737804878, 4.5689024390244, 4.5754573170732, 5.0296493902439, 5.0455030487805, 6.0759908536585, 5.9094512195122, 6.4124237804878, 6.4430640243902, 7.0826219512195, 7.0923780487805, 7.3188262195122, 7.5551829268293],
                'spinel sphere with diameter of 3.6675mm': [1, 1.026513174725, 1.4224916858532, 1.4478690202098, 1.4661959580455, 1.499452545408, 1.7891839345101, 1.8768994627782, 1.9645945254541, 1.9786543873113, 2.0334612432847, 2.1452852391916, 2.1561524686621, 2.2533435661294, 2.2905090816065, 2.3331798413917, 0, 2.4567715528268, 2.4925556408289, 2.5661806088514, 2.6055768738808, 2.6692760296751, 2.7140956766436, 2.7543617293425, 2.7710411870043],
                'pot lid': [1, 3.2, 6.23, 6.27, 9.92, 14.15]
            };

            if (isString(index)) {
                if (index in modes) {
                    return toFloat32Array(modes[index]);
                } else {
                    return toFloat32Array(1);
                }
            } else if (isInteger(index)) {
                index = mod(index, Object.keys(modes).length);
                return toFloat32Array(modes[Object.keys(modes)[index]]);
            } else {
                var res = [];
                objForEach(modes, function (v, k) {
                    res.push(dtm.data(v).label(k));
                });
                return res;
            }
        }

        // TODO: typed?
        function fibonacci(len) {
            var res = new Float32Array(len);
            res[0] = 1;

            if (len > 1) {
                res[1] = 1;
                for (var i = 2; i < len; i++) {
                    res[i] = res[i-1] + res[i-2];
                }
            }
            return res;
        }

        function gauss(len) {
            var res = new Float32Array(len);

            for (var i = 0; i < len; i++) {
                var x = -Math.PI + (Math.PI * 2 / len) * i;
                res[i] = Math.pow(Math.E, -0.5 * Math.pow(x, 2)) / Math.sqrt(2 * Math.PI) / 0.4 * (params.max - params.min) + params.min;
            }

            return res;
        }

        generator.val = [];

        var sorted;
        if (isTypeCategOf('noMinMaxDir') || isTypeCategOf('random')) {
            sorted = dtm.transform.sort([params.min, params.max]);
        }

        // TODO: params or paramsExt?
        switch (params.type) {
            case 'line':
            case 'saw':
                generator.val = line(generator.length, params.min, params.max);
                break;

            case 'rise':
                generator.val = line(generator.length, sorted[0], sorted[1]);
                break;

            case 'decay':
            case 'fall':
                generator.val = line(generator.length, sorted[1], sorted[0]);
                break;

            case 'adsr':
            case 'ADSR':
                break;

            case 'sin':
            case 'sine':
                generator.val = sin(generator.length, params.min, params.max, params.amp, params.cycle, paramsExt.phase);
                break;

            case 'cos':
            case 'cosine':
                generator.val = cos(generator.length, params.min, params.max, params.amp, params.cycle, 0.00);
                break;

            case 'tri':
            case 'triangle':
                break;

            case 'harm':
            case 'harmonic':
                break;

            case 'rf':
            case 'rand':
            case 'random':
                generator.val = random(generator.length, sorted[0], sorted[1], 1.0, false);
                break;

            case 'noise':
                generator.val = random(generator.length, sorted[0], sorted[1], params.amp, false);
                break;

            case 'ri':
            case 'randi':
                generator.val = random(generator.length, sorted[0], sorted[1], 1.0, true);
                break;

            case 'r':
            case 'range':
                generator.val = range(paramsExt.start, paramsExt.end, paramsExt.interval);
                break;

            case 'seq':
                generator.val = sequence(params.min, params.max);
                break;

            case 'scale':
                generator.val = scale(paramsExt.scale, paramsExt.transpose);
                break;

            case 'modal':
            case 'modes':
            case 'mode':
                generator.val = modal(paramsExt.index);
                break;

            case 'fibonacci':
                generator.val = fibonacci(generator.length);
                break;

            case 'zeros':
            case 'zeroes':
                generator.val = constant(generator.length, 0);
                break;

            case 'ones':
                generator.val = constant(generator.length, 1);
                break;

            case 'const':
                generator.val = constant(generator.length, params.const);
                break;

            case 'string':
            case 'str':
            case 's':
            case 'characters':
            case 'character':
            case 'chars':
            case 'char':
            case 'c':
                generator.val = params.string.split('');
                break;

            default:
                break;
        }

        generator.length = generator.val.length;
        generator.meta.setOriginal(generator.val);
    }

    /**
     * Sets the method of generating a shape
     * @function module:generator#type
     * @param type {string}
     * @returns {array}
     */
    generator.type = function (type) {
        if (isString(type)) {
            if (types.all.indexOf(type) > -1) {
                params.type = type;
            }
        }

        process(); // TODO: gets called too many times?
        return generator;
    };

    /**
     * @function module:generator#size
     * @param length
     * @returns {array}
     */
    generator.size = function (length) {
        if (isString(length) && length[0] === 'a') {
            params.autolen = true;
            return generator;
        }

        var len = parseInt(length);
        if (!isNaN(len) && len > 0) {
            generator.length = len;
        }

        process();
        return generator;
    };

    generator.start = function (val) {
        if (isNumber(val)) {
            paramsExt.start = val;
        }
        process();
        return generator;
    };

    generator.end = function (val) {
        if (isNumber(val)) {
            paramsExt.end = val;
        }
        process();
        return generator;
    };

    generator.interval = function (val) {
        if (isNumber(val)) {
            paramsExt.interval = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#amp
     * @param amp
     * @returns {array}
     */
    generator.oscamp = function (amp) {
        var val = parseFloat(amp);
        if (!isNaN(val)) {
            params.amp = val;
        }
        process();
        return generator;
    };

    /**
     * @function module:generator#cycle | cycles | freq
     * @param cycle
     * @returns {array}
     */
    generator.cycle = function (cycle) {
        var val = parseFloat(cycle);
        if (!isNaN(val)) {
            params.cycle = val;
        }
        process();
        return generator;
    };

    // overriding with array.freq
    // generator.freq = generator.cycle;

    // generator.phase conflicts with array.phase
    generator.offset = function (phase) {
        if (isNumber(phase)) {
            paramsExt.phase = phase;
        }
        process();
        return generator;
    };

    // generator.offset = generator.phase;

    /**
     * @function module:generator#const
     * @param value
     * @returns {array}
     */
    generator.const = function (value) {
        if (isSingleVal(value)) {
            params.const = value;
        }
        process();
        return generator;
    };

    generator.transpose = function (value) {
        if (isInteger(value)) {
            paramsExt.transpose = value;
        } else if (isDtmArray(value)) {
            paramsExt.transpose = value.get(0);
        }
        process();
        return generator;
    };

    // TODO: do more readable type check
    generator.length = 8;

    if (arguments.length >= 1) {
        if (isObject(arguments[0])) {
            if (!isArray(arguments[0])) {
                objForEach(arguments[0], function (iter) {
                    if (params.hasOwnProperty(iter)) {
                        params[iter] = arguments[0][iter];
                    }
                });
            }
        } else {
            // set the generator type from arg 0
            if (isString(arguments[0])) {
                generator.type(arguments[0]);
            }
        }

        if (isObject(arguments[1])) {
            if (!isArray(arguments[1])) {
                objForEach(arguments[1], function (iter) {
                    if (params.hasOwnProperty(iter)) {
                        params[iter] = arguments[1][iter];
                    }
                });
            }
        }
    }

    if (arguments.length <= 2) {
        if (isTypeCategOf('oscil')) {
            params.min = -1.0;
            params.max = 1.0;
        } else {
            params.min = 0.0;
            params.max = 1.0;
        }
    }

    if (isTypeCategOf('envelope')) {
        generator.length = 128;
    }

    if (isTypeCategOf('random')) {
        generator.length = 1;
        params.min = 0.0;

        if (params.type === 'randi' || params.type === 'ri') {
            params.max = 2;
        } else {
            params.max = 1.0;
        }

        if (arguments.length >= 2 && isInteger(arguments[1])) {
            generator.length = arguments[1] > 0 ? arguments[1] : 1;
        }

        if (arguments.length === 3) {
            if (isNumber(arguments[2])) {
                params.max = arguments[2];
            } else if (isNumOrFloat32Array(arguments[2])) {

            } else if (isNumDtmArray(arguments[2])) {

            }
        } else if (arguments.length === 4) {
            if (isNumber(arguments[2])) {
                params.min = arguments[2];
            }
            if (isNumber(arguments[3])) {
                params.max = arguments[3];
            }
        }
    } else if (isTypeCategOf('oscil')) {
        generator.length = 4096;

        // TODO: temporary
        if (arguments.length === 2 && isInteger(arguments[1])) {
            generator.length = arguments[1] > 0 ? arguments[1] : 4096;
        }

        if (arguments.length >= 3) {
            if (isArray(arguments[2])) {
                if (arguments[2].length === 1) {
                    generator.oscamp(arguments[2][0]);
                } else if (arguments[2].length === 2) {
                    params.min = arguments[2][0];
                    params.max = arguments[2][1];
                }
            } else {
                generator.oscamp(arguments[2]);
            }
        }

        if (arguments.length === 3) {
            // set as amplitude
            params.min = -1.0;
            params.max = 1.0;
            generator.oscamp(arguments[2]);
        }

        if (arguments.length === 4) {
            if (isArray(arguments[3])) {
                if (arguments[3].length === 2) {
                    params.min = arguments[3][0];
                    params.max = arguments[3][1];
                }
            } else {
                params.min = -1.0;
                params.max = 1.0;
                generator.cycle(arguments[3]);
            }
        }
    } else if (arguments.length >= 2) {
        if (isTypeCategOf('string')) {
            if (isString(arguments[1])) {
                params.string = arguments[1];
                params.typed = false;
            } else {
                params.string = String(arguments[1]);
            }
        } else if (params.type === 'range' || params.type === 'r') {
            if (isNumArray(arguments[1])) {
                if (arguments[1].length === 1) {
                    // TODO: reduce the redundant process()
                    generator.start(0.0);
                    generator.end(arguments[1][0]);
                } else if (arguments[1].length >= 2) {
                    generator.start(arguments[1][0]);
                    generator.end(arguments[1][1]);
                }

                if (arguments[1].length === 3) {
                    generator.interval(arguments[1][2]);
                }
            } else {
                if (arguments.length === 2 && isNumber(arguments[1])) {
                    generator.start(0.0);
                    generator.end(arguments[1]);
                } else if (arguments.length >= 3) {
                    if (isNumber(arguments[1])) {
                        generator.start(arguments[1]);
                    }
                    if (isNumber(arguments[2])) {
                        generator.end(arguments[2]);
                    }
                }

                if (arguments.length === 4) {
                    generator.interval(arguments[3]);
                }
            }
        } else if (params.type === 'seq') {
            // TODO: incomplete
            params.min = arguments[1];
            params.max = arguments[2];
        } else if (params.type === 'scale') {
            if (isString(arguments[1])) {
                paramsExt.scale = arguments[1];
            }
            if (isInteger(arguments[2])) {
                paramsExt.transpose = arguments[2];
            }
            //process();
        } else if (params.type === 'modal' || params.type === 'modes' || params.type === 'mode') {
            paramsExt.index = arguments[1];
        } else if (isTypeCategOf('const')) {
            if (!isEmpty(arguments[1])) {
                params.const = arguments[1];
                generator.length = 1;
            }
        } else {
            // set the length from arg 1
            generator.size(arguments[1]);

            if (arguments.length >= 3) {
                if (isArray(arguments[2])) {
                    if (arguments[2].length === 1) {
                        params.max = arguments[2][0];
                    } else if (arguments[2].length === 2) {
                        params.min = arguments[2][0];
                        params.max = arguments[2][1];
                    }
                } else {
                    if (arguments.length === 3) {
                        // set as 0 - max
                        params.min = 0;
                        params.max = arguments[2];
                        generator.oscamp(1.0);
                    }

                    if (arguments.length >= 4) {
                        params.min = arguments[2];
                        params.max = arguments[3];
                    }
                }
            }
        }
    }

    process();
    return generator;
};

dtm.g = dtm.gen = dtm.generator;

// creating shorthand modules
var generators = ['line', 'rise', 'decay', 'fall', 'seq', 'sequence', 'series', 'range', 'r', 'noise', 'random', 'rand', 'rf', 'randi', 'ri', 'gaussian', 'gauss', 'normal', 'zeros', 'zeroes', 'ones', 'constant', 'constants', 'const', 'consts', 'repeat', 'string', 'str', 'sin', 'sine', 'cos', 'cosine', 'tri', 'triangle', 'saw', 'fibonacci', 'decay', 'scale', 'modal', 'modes', 'mode', 'sig', 'sigmoid', 'logistic'];

generators.forEach(function (type) {
    dtm[type] = function () {
        var args = [type].concat(argsToArray(arguments));
        return dtm.generator.apply(this, args);
    }
});
/**
 * @fileOverview Parses random stuff. Singleton.
 * @module parser
 */

dtm.parser = {
    type: 'dtm.parser',

    /**
     * @function module:parser#csvToJson
     * @category Parser
     * @param csv {string}
     * @returns {array} Array of JSON objects
     * @example
     *
     * var dummyCsv =
     *     'foo, bar, buz\r' +
     *     '123, 456.78, hey\r' +
     *     '789, 444.44, hoo';
     *
     * var dummyJson = p.csvToJson(dummyCsv);
     *
     * console.log(dummyJson);
     * -> [{foo: 123, bar: 456.78, buz:'hey'}, {foo: 789, bar: 444.44, buz:'hoo'}]
     */
    csvToJson: function (csv) {
        var lines = csv.split("\n"); // \r for Macs
        var result = [];
        var headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");

            if (currentline.length > 1) {
                for (var j = 0; j < headers.length; j++) {
                    var val = currentline[j];
                    if (!isNaN(val)) {
                        val = Number.parseFloat(val);
                    }
                    obj[headers[j]] = val;
                }

                result.push(obj);
            }
        }

        return result; //JavaScript object
//        return JSON.stringify(result); //JSON
    },

    csvToCols: function (csvText) {
        var linebreak = csvText.indexOf('\n') > -1 ? '\n' : '\r';
        var lines = csvText.split(linebreak);
        var headers = lines[0].split(",");

        var obj = {}, empty = 0;

        function dealWithCommas(lineArr) {
            for (var i = lineArr.length-1; i > 0; i--) {
                if (isString(lineArr[i-1]) && isString(lineArr[i])) {
                    if (lineArr[i].endsWith('"') || lineArr[i].endsWith('"')) {
                        lineArr[i-1] = lineArr[i-1].concat(', ' + lineArr[i]);
                        lineArr.splice(i, 1);
                    }
                }
            }
            return lineArr;
        }

        headers.forEach(function (v, i) {
            // remove new-line, etc.
            headers[i] = v.trim();

            // remove redundant double quotes
            if (v[0] === '"' && v[v.length-1] === '"') {
                v = v.slice(1, -1);
            }
            headers[i] = v.trim(); // removes redundant spaces at the both ends

            if (v === '') {
                headers[i] = '(empty_' + (empty++) + ')';
            }
        });

        headers = dealWithCommas(headers);

        headers.forEach(function (v) {
            obj[v] = [];
        });

        for (var i = 1; i < lines.length; i++) {
            var currentline = lines[i].split(",");

            if (currentline.length > 1) {
                for (var j = 0; j < currentline.length; j++) {
                    var val = currentline[j];

                    // remove redundant double quotes
                    if (val[0] === '"' && val[val.length-1] === '"') {
                        val = val.slice(1, -1);
                    }

                    val = val.trim();

                    if (!isNaN(val)) {
                        val = parseFloat(val);
                    }

                    if (isNaNfast(val)) {
                        val = null;
                    }

                    currentline[j] = val;
                }

                currentline = dealWithCommas(currentline);

                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]].push(currentline[j]);
                }
            }
        }

        return obj; //JavaScript object
    },

    /**
     * Parses the value types from a given row of a collection.
     * @function module:parser#valueTypes
     * @param row {array}
     * @returns {array}
     */
    valueTypes: function (row) {
        var types = [];

        row.forEach(function (val, idx) {
            var parsedVal = parseFloat(val);

            if (isNaN(parsedVal)) {
                types.push('string');
            } else {
                if (val.indexOf('.') > -1) {
                    types.push('float');
                } else {
                    types.push('int');
                }
            }
        });

        return types;
    },

    // CHECK: this only works w/ json...
    /**
     * Returns the column & row size of the collection
     * @function module:parser#getSize
     * @param json
     * @returns {array}
     */
    getSize: function (json) {
        var col = numProperties(json[0]); // header
        var row = numProperties(json);
        return [col, row];
    }
};
/**
 * @fileOverview Data object. Extends the dtm.data class, storing a multi-dimensional array.
 * @module loader
 */

/**
 * Creates a new dtm.data (array) object, if the argument is empty, or a promise object, if the argument is a URL.
 * @function module:data.data
 * @param [input] {string} URL to load or query the data
 * @param fn {function}
 * @returns {dtm.data | promise}
 */
dtm.load = function (input, fn) {
    if (isString(input)) {
        var url = input;

        return new Promise(function (resolve) {
            var ext = url.split('.').pop(); // checks the extension

            if (ext === 'jsonp') {
                var cbName = 'jsonp_callback_' + Math.round(100000 * Math.random());
                window[cbName] = function (res) {
                    delete window[cbName];
                    document.body.removeChild(script);

                    var keys = Object.keys(res);

                    keys.forEach(function (val) {
                        // CHECK: this is a little too case specific
                        if (val !== 'response') {
                            params.coll = res[val];
                            params.keys = Object.keys(params.coll[0]);
                            setArrays();
                            setTypes();
                            setSize();

                            resolve(data);
                        }
                    });

                    if (typeof(cb) !== 'undefined') {
                        cb(data);
                    }
                };

                var script = document.createElement('script');
                script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
                document.body.appendChild(script);

            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                //xhr.withCredentials = 'true';

                switch (ext) {
                    case 'txt':
                    case 'csv':
                        break;
                    case 'json':
                        //xhr.responseType = 'json';
                        break;
                    case 'wav':
                    case 'aif':
                    case 'aiff':
                    case 'ogg':
                    case 'mp3':
                        xhr.responseType = 'arraybuffer';
                        break;
                    case 'png':
                    case 'jpg':
                    case 'jpeg':
                        xhr.responseType = 'blob';
                        break;
                    default:
                        //xhr.responseType = 'blob';
                        break;
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {

                        // for audio sample
                        if (xhr.responseType === 'arraybuffer') {

                            if (dtm.wa.isOn) {
                                dtm.wa.actx.decodeAudioData(xhr.response, function (buf) {
                                    var data = dtm.data();
                                    var arrays = [];
                                    for (var c = 0; c < buf.numberOfChannels; c++) {
                                        var floatArr = buf.getChannelData(c);
                                        arrays.push(dtm.data(Array.prototype.slice.call(floatArr)).label('ch_' + c).parent(data));
                                    }

                                    if (!isEmpty(fn)) {
                                        fn(data.set(arrays));
                                    }

                                    resolve(data.set(arrays));
                                });
                            }
                        } else if (xhr.responseType === 'blob') {
                            var img = new Image();
                            img.onload = function () {
                                var canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;

                                var context = canvas.getContext('2d');
                                context.drawImage(img, 0, 0);

                                var res = [];

                                var imageData = context.getImageData(0, 0, img.width, img.height).data;
                                for (var c = 0; c < img.width; c++) {
                                    res.push(imageData.filter(function (v, i) {
                                        return i % (img.width*4) === c;
                                    }));
                                }
                                console.log(res);
                            };
                            img.src = window.URL.createObjectURL(xhr.response);

                        } else {
                            var keys = [];

                            if (ext === 'csv') {
                                var data = dtm.data();
                                var arrays = [];
                                objForEach(dtm.parser.csvToCols(xhr.response), function (v, k) {
                                    var a = dtm.data(v).label(k).parent(data);
                                    arrays.push(a);
                                });

                            } else if (ext === 'json') {
                                var res = xhr.responseText;

                                try {
                                    res = JSON.parse(res);
                                } catch (e) {
                                    try {
                                        res = eval(res);
                                    } catch (e) {
                                        console.log('Could not parse the JSON file. Maybe the format is not right.');
                                    }
                                }


                                if (url.indexOf('wunderground') > -1) {
                                    var obj = JSON.parse(xhr.response);
                                    params.coll = obj[Object.keys(obj)[1]];

                                    if (params.coll.constructor === Array) {
                                        // for hourly forecast
                                        keys = Object.keys(params.coll[0]);
                                    } else {
                                        // for current weather
                                        keys = Object.keys(params.coll);
                                        params.coll = [params.coll];
                                    }
                                } else {
                                    var second = res[Object.keys(res)[0]];

                                    if (second.constructor === Array) {
                                        keys = Object.keys(second[0]);
                                    } else {
                                        keys = Object.keys(second);
                                    }

                                    // TODO: may not work with non-array JSON formats
                                    params.coll = res;
                                }
                            } else {
                                // TODO: this only works for shodan
                                //params.coll = JSON.parse(xhr.response)['matches'];

                                params.coll = second;
                            }

                            if (!isEmpty(fn)) {
                                fn(data.set(arrays));
                            }

                            resolve(data.set(arrays));
                        }
                    }
                };

                xhr.send();
            }
        });
    } else {
        var elem_files = input;
        var fileType = null;
        var reader = new FileReader();
        if (elem_files[0].name.match(/.+\.json/gi)) {
            fileType = 'json';
        } else if (elem_files[0].name.match(/.+\.csv/gi)) {
            fileType = 'csv';
        }
        reader.readAsText(elem_files[0]);
        return new Promise(function (resolve) {
            reader.onload = function (e) {
                if (fileType === 'json') {
                    resolve(JSON.parse(e.target.result));
                } else if (fileType === 'csv') {
                    //resolve(dtm.parser.csvToCols(e.target.result));
                    var data = dtm.data();
                    var arrays = [];
                    objForEach(dtm.parser.csvToCols(e.target.result), function (v, k) {
                        var a = dtm.data(v).label(k).parent(data);
                        arrays.push(a);
                    });

                    if (!isEmpty(fn)) {
                        fn(data.set(arrays));
                    }

                    resolve(data.set(arrays));
                }
            };
        });
    }
};

dtm.csv = function (input, fn) {
    if (isString(input)) {
        var p = new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', input, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = dtm.data();
                    var arrays = [];
                    objForEach(dtm.parser.csvToCols(xhr.response), function (v, k) {
                        var a = dtm.data(v).label(k).parent(data);
                        arrays.push(a);
                    });

                    if (!isEmpty(fn)) {
                        fn(data.set(arrays));
                    }

                    // resolve(data.set(arrays));
                    resolve(arrays);
                }
            };

            xhr.send();
        });

        var data = dtm.data();
        p.then(function (d) {
            data.set(d);
        });

        return data;
    } else {
        var elem_files = input;
        var reader = new FileReader();

        reader.readAsText(elem_files[0]);
        return new Promise(function (resolve) {
            reader.onload = function (e) {
                //resolve(dtm.parser.csvToCols(e.target.result));
                var data = dtm.data();
                var arrays = [];
                objForEach(dtm.parser.csvToCols(e.target.result), function (v, k) {
                    var a = dtm.data(v).label(k).parent(data);
                    arrays.push(a);
                });

                if (!isEmpty(fn)) {
                    fn(data.set(arrays));
                }

                resolve(data.set(arrays));
            };
        });
    }
};

dtm.json = function (input, fn) {

};

dtm.text = function (input, fn) {
    if (isString(input)) {
        var p = new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', input, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = dtm.data();
                    if (isString(xhr.response)) {
                        data.set(xhr.response);
                    } else {
                        throw(new TypeError('the file content is not text'));
                    }

                    if (!isEmpty(fn)) {
                        fn(data);
                    }

                    // resolve(data);
                    resolve(xhr.response);
                }
            };

            xhr.send();
        });

        var data = dtm.data();
        p.then(function (res) {
            p = data.set(res);
        });

        return data;
    } else {
        var elem_files = input;
        var reader = new FileReader();

        reader.readAsText(elem_files[0]);
        return new Promise(function (resolve) {
            reader.onload = function (e) {
                var data = dtm.data();
                if (isString(e.target.result)) {
                    data.set(e.target.result);
                }

                if (!isEmpty(fn)) {
                    fn(data);
                }

                resolve(data);
            };
        });
    }
};

dtm.txt = dtm.text;

dtm.web = function (url, fn) {
    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = dtm.data();

                if (url.indexOf('wunderground') > -1) {
                    var obj = JSON.parse(xhr.response);

                    // hard coding...
                    data.label('hourly_forecast');
                    var coll = obj['hourly_forecast'];
                    var keys = Object.keys(coll[0]);

                    function mapObjArray(objArray) {
                        var keys = Object.keys(objArray[0]);
                        var res = keys.map(function (k) {
                            var temp = objArray.map(function (doc) {
                                return doc[k];
                            });

                            var resArray = dtm.data(temp).label(k);

                            if (isParsableNumArray(temp)) {
                                resArray.tonum();
                            }
                            return resArray;
                        });
                        return dtm.data(res);
                    }

                    var res = [];

                    keys.forEach(function (k) {
                        var temp = coll.map(function (doc) {
                            return doc[k];
                        });

                        if (isObjArray(temp)) {
                            temp = mapObjArray(temp);
                        }

                        var resArray = dtm.data(temp).label(k).parent(data);
                        if (isParsableNumArray(temp)) {
                            resArray.tonum();
                        }

                        res.push(resArray);
                    });
                } else {
                    // TODO: this only works for shodan
                    var coll = JSON.parse(xhr.response)['matches'];


                    // params.coll = JSON.parse(xhr.response)['matches'];
                    // params.coll = second;

                    //var second = res[Object.keys(res)[0]];
                    //
                    //if (second.constructor === Array) {
                    //    keys = Object.keys(second[0]);
                    //} else {
                    //    keys = Object.keys(second);
                    //}
                    //
                    //// TODO: may not work with non-array JSON formats
                    //params.coll = res;
                }

                if (!isEmpty(fn)) {
                    fn(data.set(res));
                }

                resolve(data.set(res));
            } else {
            }
        };

        xhr.send();
    });
};

dtm.image = function (input, fn, mode) {
    if (isString(input)) {
        var url = input;

        if (!isString(mode)) {
            mode = 'brightness';
        }

        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.open('GET', url, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = dtm.data();

                    var img = new Image();
                    img.onload = function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;

                        var context = canvas.getContext('2d');
                        context.drawImage(img, 0, 0);

                        var imageData = context.getImageData(0, 0, img.width, img.height).data;

                        if (mode === 'brightness') {
                            var bri = new Float32Array(imageData.length/4);

                            for (var i = 0; i < imageData.length; i += 4) {
                                var brightness = 0.34 * imageData[i] + 0.5 * imageData[i+1] + 0.16 * imageData[i+2];
                                bri[i/4] = brightness/255;
                            }
                            data.set(bri).block(img.width).label('brightness');
                        } else if (mode === 'hue') {
                            var hue = new Float32Array(imageData.length/4);
                            var r, g, b, h;
                            var max, min;

                            for (var i = 0; i < imageData.length; i += 4) {
                                r = imageData[i]/255;
                                g = imageData[i+1]/255;
                                b = imageData[i+2]/255;

                                max = Math.max(r, g, b);
                                min = Math.min(r, g, b);

                                if (max === r) {
                                    h = (g - b) / (max - min);
                                } else if (max === g) {
                                    h = 2 + (b - r) / (max - min);
                                } else {
                                    h = 4 + (r - g) / (max - min);
                                }

                                h *= 60;

                                if (h < 0) {
                                    h += 360;
                                }

                                hue[i/4] = h;
                            }

                            data.set(hue).block(img.width).label('hue');
                        } else if (mode === 'heatmap') {
                            var hue = new Float32Array(imageData.length/4);
                            var r, g, b, h;
                            var max, min;

                            for (var i = 0; i < imageData.length; i += 4) {
                                r = imageData[i]/255;
                                g = imageData[i+1]/255;
                                b = imageData[i+2]/255;

                                max = Math.max(r, g, b);
                                min = Math.min(r, g, b);

                                if (max === r) {
                                    h = (g - b) / (max - min);
                                } else if (max === g) {
                                    h = 2 + (b - r) / (max - min);
                                } else {
                                    h = 4 + (r - g) / (max - min);
                                }

                                h *= 60;

                                if (h < -30) {
                                    h += 360;
                                }

                                if (h < 0) {
                                    h = 0;
                                }

                                if (h > 300) {
                                    h = 300;
                                }

                                if (r+g+b < 0.15) {
                                    h = 300;
                                }

                                if (isNaN(h)) {
                                    h = 0;
                                }

                                hue[i/4] = 1 - (h / 300);
                            }

                            data.set(hue).block(img.width).label('hue');
                        } else if (mode === 'rgb') {
                            var red = new Float32Array(imageData.length/4);
                            var green = new Float32Array(imageData.length/4);
                            var blue = new Float32Array(imageData.length/4);

                            for (var i = 0; i < imageData.length; i += 4) {
                                red[i/4] = imageData[i]/255;
                                green[i/4] = imageData[i+1]/255;
                                blue[i/4] = imageData[i+2]/255;
                            }
                            data.set(red).block(img.width).label('red');
                        }

                        if (!isEmpty(fn)) {
                            fn(data);
                        }

                        resolve(data);
                    };
                    img.src = window.URL.createObjectURL(xhr.response);
                }
            };

            xhr.send();
        });
    } else {
        var elem_files = input;
        var fileType = null;
        var reader = new FileReader();
        if (elem_files[0].name.match(/.+\.json/gi)) {
            fileType = 'json';
        } else if (elem_files[0].name.match(/.+\.csv/gi)) {
            fileType = 'csv';
        }
        reader.readAsText(elem_files[0]);
        return new Promise(function (resolve) {
            reader.onload = function (e) {
                if (fileType === 'json') {
                    resolve(JSON.parse(e.target.result));
                } else if (fileType === 'csv') {
                    //resolve(dtm.parser.csvToCols(e.target.result));
                    var data = dtm.data();
                    var arrays = [];
                    objForEach(dtm.parser.csvToCols(e.target.result), function (v, k) {
                        var a = dtm.data(v).label(k).parent(data);
                        arrays.push(a);
                    });

                    if (!isEmpty(fn)) {
                        fn(data.set(arrays));
                    }

                    resolve(data.set(arrays));
                }
            };
        });
    }
};

dtm.pic = dtm.img = dtm.image;

dtm.cam = function (input, interval) {
    var w = 400;
    var h = 300;

    var data, fn;

    if (isDtmArray(input)) {
        data = input;
    } else if (isFunction(input)) {
        fn = input;
    }
    if (isEmpty(data)) {
        data = dtm.data(0);
    }

    if (!isNumber(interval) || interval < 0) {
        interval = 1;
    }

    navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

    if (navigator.getUserMedia) {
        navigator.getUserMedia({
                audio: false,
                video: {
                    width: w,
                    height: h
                }
            },
            function (stream) {
                var video;
                if (document.getElementById('cam')) {
                    video = document.getElementById('cam');
                } else {
                    video = document.createElement('video');
                }
                video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;

                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;

                var context = canvas.getContext('2d');
                context.fillRect(0, 0, w, h);

                video.onloadedmetadata = function (e) {
                    video.play();
                    video.muted = 'true';
                };

                dtm.clock(function () {
                    context.drawImage(video, 0, 0, w, h);
                    var imageData = context.getImageData(0, 0, w, h).data;

                    var res = new Float32Array(imageData.length/4);

                    for (var i = 0; i < imageData.length; i += 4) {
                        var brightness = 0.34 * imageData[i] + 0.5 * imageData[i+1] + 0.16 * imageData[i+2];
                        // // red
                        // imageData[i] = brightness;
                        // // green
                        // imageData[i+1] = brightness;
                        // // blue
                        // imageData[i+2] = brightness;

                        res[i/4] = brightness/255;
                    }
                    data.set(res).block(w);

                    if (!isEmpty(fn)) {
                        fn(data);
                    }

                }).interval(interval);
            },
            function (err) {
                console.log(err);
            }
        );
    } else {
        console.log('getUserMedia not supported');
    }
};

dtm.audio = function (grab, block) {
    if (isNumber(grab)) {
        block = grab;
    } else if (!isNumber(block)) {
        block = 1024;
    }

    var data = dtm.data(0);
    dtm.params.stream = true;

    navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

    if (navigator.getUserMedia) {
        navigator.getUserMedia({
                audio: {
                    mandatory: {
                        googEchoCancellation: 'false',
                        googAutoGainControl: 'false',
                        googNoiseSuppression: 'false',
                        googHighpassFilter: 'false'
                    },
                    optional: []
                },
                video: false
            },
            function (stream) {
                // data = dtm.data();

                var actx = dtm.wa.actx;
                var input = actx.createMediaStreamSource(stream);
                var sp = actx.createScriptProcessor(block,1,1);

                // TODO: not getting destoryed properly
                sp.onaudioprocess = function (event) {
                    if (dtm.params.stream) {
                        var samps = event.inputBuffer.getChannelData(0);

                        if (isDtmArray(grab)) {
                            grab.set(samps);
                        } else if (isFunction(grab)) {
                            grab(data.set(samps));
                        } else {
                            data.set(samps); // not working
                        }
                    }
                };

                var gain = actx.createGain();
                gain.gain.value = 0;

                input.connect(sp).connect(gain).connect(actx.destination);
            },
            function (e) {
                console.error(e);
            });
    }

    return data;
};
/**
 * @fileOverview WebAudio buffer-based clock. Somewhat precise. But buggy.
 * @module clock
 */

/**
 * Creates a new instance of clock.
 * @function module:clock.clock
 * @param [bpm=true] {boolean|number} Synchronization or Tempo setting. If given a boolean, or string "sync", it sets the current sync state of the clock as a slave to the master clock. If given a number, it sets the unsynced tempo in beats-per-minute. Default BPM for unsynced clock is 120. Recommended value range is around 60-140.
 * @param [subDiv=16] {number} Sub division / tick speed. Recommended: 4, 8, 16, etc.
 * @param [autoStart=true] {boolean} If true, the clock is started when it is instantiated. Works well with a synced clock.
 * @returns {dtm.clock} a new clock object
 * @example
 *
 * var cl = dtm.clock(120);
 * cl.start();
 */
dtm.clock = function (bpm, subDiv, autoStart) {
    var params = {
        // webAudio, animationFrame, date, hrtime (node)
        source: 'animationFrame',

        name: null,
        isOn: false,
        sync: true,
        isMaster: false,

        bpm: 120,
        interval: { base: dtm.array([[0.5]]) },
        subDiv: 2,
        random: 0,
        swing: 0.5,

        current: 0,
        previous: 0,
        reported: 0,
        resolution: 480,
        beat: 0,
        prevBeat: -1,

        lookahead: 0.1,
        offset: 0,
        requestId: null,
        autoStart: true,

        time: [4, 4]
    };

    var clock = {
        type: 'dtm.clock',

        interval: 1,
        beat: 0,
        list: [],

        // temp
        prev: 0,

        // CHECK: public - just for debugging
        callbacks: []
    };

    // member?
    var curTime = 0.0;

    var actx = null, clockBuf = null;

    function setFinal(param) {
        ['bpm', 'time', 'interval'].forEach(function (v) {
            params[v].isFinal = v === param;
        });
    }

    /**
     * Get the value of a parameter of the clock object.
     * @function module:clock#get
     * @param param
     * @returns {*}
     */
    clock.get = function (param) {
        switch (param) {
            case 'bpm':
            case 'tempo':
                if (params.sync) {
                    return dtm.master.get('clock').get('bpm');
                } else {
                    return params.bpm;
                }

            case 'subdiv':
            case 'subDiv':
            case 'div':
                return params.subDiv;

            case 'time':
                return params.subDiv;

            case 'dur':
            case 'interval':
                return getInterval();

            case 'freq':
                return getFreq();

            case 'sync':
            case 'synced':
                return params.sync;

            case 'lookahead':
            case 'la':
                return params.lookahead;

            case 'isOn':
            case 'isPlaying':
                return params.isOn;

            case 'source':
                return params.source;

            case 'beat':
                return params.beat;

            case 'cur':
            case 'current':
                return params.current;

            case 'prev':
            case 'previous':
                return params.previous;

            case 'rep':
            case 'reported':
                return params.reported;

            default:
                return clock;
        }
    };

    /**
     * Set the main parameters of the clock.
     * @function module:clock#set
     * @param [bpm] {boolean|number} Synchronization or Tempo setting. If given a boolean, it sets the current sync state of the clock to the master clock. If given a number, it sets the unsynced tempo in beats-per-minute. Default BPM is 120. Recommended value range is around 60-140.
     * @param [subDiv=16] {number} Sub division / tick speed. Recommended: 4, 8, 16, etc.
     * @param [autoStart=true] {boolean} If true, the clock is started when it is instantiated. Works well with a synced clock.
     * @returns {dtm.clock}
     */
    clock.set = function (bpm, subDiv, autoStart) {
        if (isFunction(bpm)) {
            clock.callback(bpm);
        } else {
            clock.bpm(bpm);
        }

        if (!isEmpty(subDiv)) {
            clock.subdiv(subDiv);
        }

        if (isBoolean(autoStart)) {
            params.autoStart = autoStart;
        }

        return clock;
    };

    /**
     * Sets the clock to be synced to the master clock. When set true, the tempo/BPM in itself is ignored.
     * @function module:clock#sync
     * @param [bool=true] {boolean}
     * @returns {dtm.clock}
     */
    clock.sync = function (bool) {
        if (!isBoolean(bool)) {
            bool = true;
        }

        params.sync = bool;
        return clock;
    };

    /**
     * Sets the speed of the clock in BPM,
     * @method module:clock#bpm
     * @param bpm {number} BPM value
     * @returns {dtm.clock} self
     * @example
     *
     * var cl = dtm.createClock();
     * cl.bpm(90);
     */
    clock.bpm = function (bpm) {
        if (isNumber(bpm)) {
            params.bpm = bpm;
            params.sync = false;
        } else if (isBoolean(bpm)) {
            params.sync = bpm;
        } else if (bpm == 'sync') {
            params.sync = true;
        }

        return clock;
    };

    clock.tempo = clock.bpm;

    /**
     * Sets the subdivision of the clock.
     * @param [val=4] {number|string} Note quality value. E.g. 4 = quarter note, 8 = eighth note.
     * @returns {dtm.clock}
     */
    clock.subdiv = function (val) {
        if (isNumber(val)) {
            params.subDiv = val;
        } else if (isString(val)) {
            val = val.split('/');
            try {
                val = Math.round(parseFloat(val[1])/parseFloat(val[0]));
            } catch (e) {
                return clock;
            }
            params.subDiv = val;
        }
        return clock;
    };

    clock.div = clock.subdiv;

    clock.time = function (val) {
        if (isNumber(val) && val !== 0) {
            params.subDiv = 1/val;
        }
        return clock;
    };

    clock.interval = function (sec) {
        function check(src, depth) {
            if (!isInteger(depth)) {
                depth = 3;
            }
            return isNumber(src) ||
                ((isNumArray(src) ||
                isNestedArray(src) ||
                isNestedWithDtmArray(src) ||
                isNumOrFloat32Array(src) ||
                isNumDtmArray(src) ||
                isNestedNumDtmArray(src)) && getMaxDepth(src) <= depth);
        }

        function convertShallow(src) {
            if (src.length === 1) {
                return convertShallow(src[0]);
            } else {
                if (isNestedNumDtmArray(src)) {
                    return src;
                } else if (isNestedWithDtmArray(src)) {
                    return dtm.array.apply(this, src);
                } else if (isNumDtmArray(src)) {
                    return src().block(1);
                } else if (isNestedArray(src)) {
                    return dtm.array(src);
                } else if (isNumOrFloat32Array(src)) {
                    return dtm.array(src).block(1);
                } else {
                    return dtm.array([toFloat32Array(src)]);
                }
            }
        }

        var depth = 2;

        if (isFunction(arguments[0])) {
            var res = arguments[0](params.interval.base, clock);
            params.interval.base = check(res, depth) ? convertShallow(res) : params.interval.base;
        } else {
            var argList = argsToArray(arguments);
            params.interval.base = check(argList) ? convertShallow(argList) : param;
        }

        params.sync = false;
        params.subDiv = 1.0;
        //params.bpm = 60.0 / sec * 4;
        return clock;
    };

    clock.dur = clock.int = clock.interval;

    function getInterval() {
        if (params.sync) {
            return 1.0/(dtm.master.get('clock').get('bpm')/60.0 * params.subDiv/4.0);
        } else {
            return 1.0/(params.bpm/60.0 * params.subDiv/4.0);
        }
    }

    function getFreq() {
        if (params.sync) {
            return dtm.master.get('clock').get('bpm')/60.0 * params.subDiv/4.0;
        } else {
            return params.bpm/60.0 * params.subDiv/4.0;
        }
    }

    // TODO: remove this
    clock.setTime = function (input) {
        if (isArray(input)) {
            clock.params.time = input;
        } else if (isString(input)) {
            clock.params.time = input.split('/');
        }
        return clock;
    };

    clock.meter = clock.setTime;

    clock.setMaster = function (bool) {
        params.isMaster = bool;
        return clock;
    };

    clock.lookahead = function (lookahead) {
        if (isNumber(lookahead) && lookahead >= 0.0) {
            params.lookahead = lookahead;
        }
        return clock;
    };

    clock.la = clock.lookahead;

    /**
     * Registers a callback function to selected or all ticks of the clock.
     * @function module:clock#add
     * @param cb {function} Callback function.
     * @param [name] {string}
     * @returns {dtm.clock} self
     */
    clock.add = function (cb, name) {
        // prevent adding identical functions
        var dupe = false;

        if (isString(name)) {
            clock.callbacks.forEach(function (stored) {
                if (stored.name == name) {
                    dtm.log('clock.add(): identical function exists in the callback list');
                    dupe = true;
                }
            });

            if (!dupe) {
                dtm.log('adding a new callback function to clock');
                clock.callbacks.push(cb);
            }
        } else {
            clock.callbacks.forEach(function (stored) {
                // TODO: this would disable the master clock ticking???
                //if (objCompare(stored, cb)) {
                //    dtm.log('clock.add(): identical function exists in the callback list');
                //
                //    dupe = true;
                //}
            });

            if (!dupe) {
                dtm.log('adding a new callback function to clock');
                clock.callbacks.push(cb);
            }
        }

        return clock;
    };

    clock.cb = clock.callback = clock.call = clock.register = clock.reg = clock.add;

    /**
     * @function module:clock#remove
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.remove = function (id) {
        if (isFunction(id)) {
            dtm.log('removing a calblack function');

            for (var i = clock.callbacks.length; i >= 0; i--) {
                if (objCompare(clock.callbacks[i], id)) {
                    clock.callbacks.splice(i, 1);
                }
            }
        } else if (isString(id)) {
            dtm.log('removing a calblack function: ' + id);

            for (var i = clock.callbacks.length; i >= 0; i--) {
                if (clock.callbacks[i].name == id) {
                    clock.callbacks.splice(i, 1);
                }
            }
        }

        return clock;
    };

    /**
     * @function module:clock#rem
     * @param id {function|string}
     * @returns {dtm.clock}
     */
    clock.del = clock.delete = clock.rem = clock.remove;

    /**
     * Modifies or replaces the content of a callback function while the clock may be running. Note that the target callback needs to be a named function.
     * @function module:clock#modify
     * @param id {function|string}
     * @param [fn] {function}
     * @returns {dtm.clock}
     */
    clock.modify = function (id, fn) {
        if (isFunction(id)) {
            dtm.log('modifying the callback: ' + id.name);
            clock.remove(id.name);
            clock.add(id);
        } else if (isString(id)) {
            dtm.log('modifying the callback: ' + id);
            clock.remove(id);

            // CHECK: don't add if the same name doesn't already exist
            if (fn.name == '') {
                // fn.name is read-only!
                var temp = new Function(
                    'return function ' + id + fn.toString().slice(8)
                )();
                clock.add(temp);
            } else {
                clock.add(fn);
            }
        }
        return clock;
    };

    clock.replace = clock.mod = clock.modify;

    /**
     * Starts the clock.
     * @function module:clock#start
     * @returns {dtm.clock} self
     */
    clock.start = function () {
        if (params.source === 'animationFrame') {
            window.requestAnimationFrame(clock.tick);
        }

        if (params.isMaster) {
            dtm.log('starting the master clock');
        } else {
            dtm.log('starting a clock');
        }

        if (params.isOn !== true) {
            params.isOn = true;
            clock.tick();

            if (!params.isMaster) {
                dtm.clocks.push(clock);
            }
        }
        return clock;
    };

    clock.run = clock.play = clock.start;

    var clockSrc, clockAmp;

    // TODO: refactor big time!!!!
    // TODO: also implement swing / random to the af-based clock
    /**
     * Makes the clock tick once.
     * @param [timestamp=0] {float}
     * @returns clock {dtm.clock}
     */
    clock.tick = function (timestamp) {
        if (!params.isOn) {
            // do nothing
            return clock;
        }

        var freq = 1;

        if (!params.sync && !params.isMaster) {
            if (params.source === 'webAudio') {
                actx = dtm.wa.actx;
                clockSrc = actx.createBufferSource();
                clockBuf = dtm.wa.clockBuf;
                clockSrc.buffer = clockBuf;
                clockSrc.connect(actx.destination());

                freq = params.bpm / 60.0 * (params.subDiv / 4.0);
                //var pbRate = 1/(1/freq - Math.abs(timeErr));

                clockSrc.playbackRate.value = freq * dtm.wa.clMult;
                clockSrc.playbackRate.value += clockSrc.playbackRate.value * params.random * Math.round(Math.random()*2-1);

                if (clock.beat % 2 == 0) {
                    clockSrc.playbackRate.value *= (1.0 - params.swing) / 0.5;
                } else {
                    clockSrc.playbackRate.value *= params.swing / 0.5;
                }

                clockSrc.start(actx.currentTime + 0.0000001);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    //var error = actx.currentTime - curTime;
                    //clock.tick(error);
                    clock.tick();
//                curTime = actx.currentTime;
                };

                clock.callbacks.forEach(function (cb) {
                    cb(clock);
                });

                clock.beat = (clock.beat + 1) % (params.subDiv * clock.params.time[0] / clock.params.time[1]);

            } else if (params.source === 'animationFrame') {
                params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution * params.subDiv / 4);

                if (params.reported !== params.current) {
                    if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                        params.beat = Math.round(params.current / params.resolution);
                        //console.log(params.beat);

                        clock.callbacks.forEach(function (cb) {
                            cb(clock);
                        });

                        //params.subDiv = 1.0;
                        params.bpm = 60 / params.interval.base.get('next').get() * 4;
                    }

                    params.current = params.reported;
                }

                window.requestAnimationFrame(clock.tick);
            }

        } else if (params.sync && !params.isMaster) {

        } else if (params.isMaster) {
            if (params.source === 'webAudio') {
                actx = dtm.wa.actx;
                clockSrc = actx.createOscillator();
                clockAmp = actx.createGain();
                clockSrc.connect(clockAmp);
                clockAmp.connect(actx.destination);
                clockAmp.gain.value = 0;

                freq = params.bpm / 60;
                var int = dtm.wa.clMult / freq;
                clockSrc.start(actx.currentTime);
                clockSrc.stop(actx.currentTime + int);

                clockSrc.onended = function () {
                    curTime += 1/freq;
                    var error = actx.currentTime - curTime;

                    clock.tick(error);

                    //return function (cb) {
                    //    cb();
                    //};
                };

                clock.callbacks.forEach(function (cb) {
                    cb(clock);
                });

                // clock.beat = (clock.beat + 1) % params.subDiv;
                clock.beat++;

                // clock.beat = (clock.beat + 1) % (params.subDiv * clock.params.time[0] / clock.params.time[1]);

            } else if (params.source === 'animationFrame') {
                params.reported = Math.round(timestamp / 1000. * params.bpm / 60. * params.resolution);

                if (params.reported !== params.current) {
                    if ((params.current % params.resolution) > (params.reported % params.resolution)) {
                        params.beat = Math.round((params.current-params.offset) / params.resolution);
                    }


                    clock.callbacks.forEach(function (cb) {
                        cb(clock);
                    });

                    params.current = params.reported;
                }

                params.requestId = window.requestAnimationFrame(clock.tick);
            }
        }

        return clock;
    };

    // TODO: stopping system should remove these callbacks?
    // TODO: implement shuffle and randomize
    clock.tickSynced = function () {
        if (!params.isOn || !params.sync) {
            return clock;
        }

        if (dtm.master.clock.get('source') === 'webAudio') {
            if (dtm.master.clock.beat % Math.round(params.resolution/params.subDiv) === 0) {
                clock.callbacks.forEach(function (cb) {
                    cb(clock);
                });
            }
        } else if (dtm.master.clock.get('source') === 'animationFrame') {
            if ((dtm.master.clock.get('cur') % (params.resolution/params.subDiv*4)) < params.prev) {

                params.beat = Math.round((dtm.master.clock.get('cur')-params.offset) / params.resolution * params.subDiv / 4);

                //if (params.beat > params.prevBeat) {
                clock.callbacks.forEach(function (cb) {
                    cb(clock);
                });
                //}

                params.prevBeat = params.beat;
            }
            params.prev = dtm.master.clock.get('cur') % (params.resolution / params.subDiv * 4);
        }

        return clock;
    };

    /**
     * Stops the clock.
     * @function module:clock#stop
     * @returns {dtm.clock} self
     */
    clock.stop = function () {
        if (params.isMaster) {
            dtm.log('stopping the master clock');
        } else {
            dtm.log('stopping a clock');
        }

        if (params.isOn === true) {
            params.isOn = false;
        }
        return clock;
    };

    clock.clear = function () {
        clock.callbacks = [];
        return clock;
    };

    /**
     * Applies swing to the every 2nd beat. (E.g. The 2nd 16th note in a 8th note interval).
     * @function module:clock#swing
     * @param [amt=0.5] {number} Percentage of swing. (E.g. 0.5(50%): straight, 0.75: hard swing, 0.4: pushed)
     * @returns {dtm.clock}
     */
    clock.swing = function (amt) {
        params.swing = amt || 0.5;
        return clock;
    };

    clock.shuffle = clock.swing;


    /**
     * Randomize the timings of the ticks.
     * @function module:clock#randomize
     * @param amt {number} Amount of randomization per beat (0-1).
     * @returns {dtm.clock}
     */
    clock.randomize = function (amt) {
        params.random = amt || 0;
        return clock;
    };

    clock.random = clock.randomize;
    clock.rand = clock.randomize;

    clock.reset = function () {
        //if (params.source === 'animationFrame') {
        //    window.cancelAnimationFrame(params.requestId);
        //}

        if (params.isMaster) {
            params.offset = params.current;
        } else {
            params.offset = dtm.master.clock.get('cur');
        }
        params.beat = 0;

        //clock.start();
        return clock;
    };

    clock.flush = function () {
        return clock;
    };

    clock.when = function (arr, cb) {
        if (isArray(arr)) {
            if (arr.indexOf(clock.beat) > -1) {
                if (!isEmpty(cb)) {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    clock.notWhen = function (arr, cb) {
        if (isArray(arr)) {
            if (arr.indexOf(clock.beat) == -1) {
                if (!isEmpty(cb)) {
                    cb(clock);
                }
            }
        }
        return clock;
    };

    /**
     * Executes an event at certain tick(s) of the clock.
     * @function module:clock#on
     * @param condition {string} Right now, it only supports "every".
     * @param length {number}
     * @param callback {function}
     * @returns {dtm.clock}
     * @example
     * dtm.clock().on('every', 4, callbackFunction);
     */
    clock.on = function (condition, length, callback) {
        switch (condition) {
            case 'every':
                var cb = (function (len, cb) {
                    return function (c) {
                        if (c.get('beat') % len === 0) {
                            cb(c);
                        }
                    };
                })(arguments[1], arguments[2]);

                clock.callbacks.push(cb);
                break;
            default:
                break;
        }

        return clock;
    };

    clock.seq = function (callback, seqArray, interval) {
        var cb = (function (cb, arr, len) {
            return function (c) {
                if (isEmpty(len)) {
                    len = c.get('subDiv');
                }
                if (arr.indexOf(c.get('beat') % len) > -1) {
                    cb(c);
                }
            };
        })(arguments[0], arguments[1], arguments[2]);

        clock.callbacks.push(cb);
        return clock;
    };

    // single-shot scheduler
    clock.delayEvent = function () {
        return clock;
    };

    clock.delay = clock.delayEvent;

    if (!params.isMaster && !isEmpty(dtm.master)) {
        dtm.master.clock.add(clock.tickSynced);

        if (params.autoStart) {
            clock.start();
        }
    }

    clock.set(bpm, subDiv, autoStart);

    return clock;
};

dtm.c = dtm.clock;
dtm.instr = function () {
    var instr = function () {
        return instr;
    };

    var params = {
        dur: 0.1
    };

    var s = dtm.synth().dur(params.dur).rep()
        .amp(dtm.decay().expc(10));
    var uni = dtm.model('unipolar');

    instr.play = function () {
        s.play();

        return instr;
    };

    instr.stop = function () {
        s.stop();

        return instr;
    };

    instr.pitch = function () {
        var args;
        if (argsAreSingleVals(arguments)) {
            args = argsToArray(arguments);
        } else if (arguments.length === 1) {
            args = arguments[0];
        }

        s.nn(dtm.model('unipolar')(args).range(60,90).block());
        return instr;
    };

    instr.speed = function () {
        var args;
        if (argsAreSingleVals(arguments)) {
            args = argsToArray(arguments);
        } else if (arguments.length === 1) {
            args = arguments[0];
        }

        s.int(dtm.model('unipolar')(args).range(0.5, 0.05).block());
        return instr;
    };

    return instr;
};

dtm.i = dtm.instr;
/**
 * @fileOverview Used to create a new instrument / musical models. Hopefully.
 * @module model
 */

/**
 * Creates a new empty musical model object, or overloads on an existing model in the collection.
 * @function module:model.model
 * @param [name] {string} Give it a unique name.
 * @param [categ] {string}
 * @returns a new model instance
 */
dtm.model = function (name, categ) {
    var params = {
        name: null,
        categ: 'none',
        categories: [],
        defaultCb: null,

        registering: false,
        loading: true,

        process: [],
        data: dtm.array(),
        clock: null,

        //output: null // dtm.array
        output: []
    };

    var model = function () {
        if (isFunction(params.defaultCb)) {
            return params.defaultCb.apply(this, arguments);
        } else {
            if (!!model.caller.arguments[0]) {
                if (model.caller.arguments[0].type === 'dtm.clock') {
                    params.clock = model.caller.arguments[0];
                }
            }

            if (arguments.length === 1) {
                var arg = arguments[0];

                if (isNumber(arg)) {
                    params.data.set(arg);
                } else if (isString(arg)) {
                    params.data.set(dtm.gen('s', arg)).histo();
                } else if (isNumOrFloat32Array(arg)) {
                    params.data.set(arg);
                } else if (isDtmArray(arg)) {
                    params.data.set(arg);
                } else if (isFunction(arg)) {
                    // TODO: not working
                    //params.output.push({
                    //    method: function (a, c) {
                    //        return arg(a, c);
                    //    },
                    //    params: null
                    //});
                }
            } else if (arguments.length > 1) {
                params.data.set.apply(this, arguments);
            }

            params.process.forEach(function (v) {
                v.method.apply(this, v.params);
            });

            if (params.range) {
                if (params.domain) {
                    params.data.range(params.range, params.domain);
                } else {
                    params.data.range(params.range);
                }
            } else if (params.domain) {
                params.data.normalize(params.domain);
            }

            var res = null;

            if (params.output) {
                params.output.forEach(function (v) {
                    if (params.clock) {
                        res = v.method(params.data, params.clock);
                    } else {
                        res = v.method(params.data);
                    }
                });
            }

            if (res) {
                return res;
            } else {
                return params.data;
            }
        }
    };

    model.meta = {
        type: 'dtm.model'
    };

    model.parent = {};
    model.siblings = [];

    model.mod = {};
    model.param = {};
    model.set = {};
    model.map = {};

    model.params = {};
    model.models = {};

    model.modes = {
        'literal': ['literal', 'lit', 'l'],
        'adapt': ['adapt', 'adapted', 'adaptive', 'a'],
        'preserve': ['preserve', 'preserved', 'p', 'n']
    };

    if (typeof(name) === 'string') {
        params.name = name;
    }

    if (typeof(categ) === 'string') {
        params.categ = categ;
    }

    model.default = function (callback) {
        if (typeof(callback) === 'function') {
            params.defaultCb = callback;
        }
    };

    model.get = function (param) {
        switch (param) {
            case 'name':
                return params.name;
            case 'category':
            case 'categ':
                return params.categ;
            default:
                return params.output;
        }
    };

    /**
     * Sets the category of the model.
     * @function module:model#categ
     * @param categ {string}
     * @returns {dtm.model}
     */
    model.categ = function (categ) {
        if (typeof(categ) === 'string') {
            params.categ = categ;
        }
        return model;
    };

    /**
     * Call this when creating a new model, which you want to reuse later by newly instantiating.
     * @function module:model#register
     * @returns {dtm.model}
     */
    model.register = function () {

        //if (model.register.caller.arguments[0] !== null) {
        //    dtm.modelCallers[model.get('name')] = model.register.caller;
        //    params.loading = true;
        //}
        var modelAlreadyExists = false;

        //if (model.register.caller.arguments[0]) {
        //    params.loading = true;
        //}
        //params.loadable = model.register.caller.arguments[0];

        for (var key in dtm.modelCallers) {
            if (key === model.get('name')) {
                dtm.log('model already registered: ' + model.get('name'));
                modelAlreadyExists = true;
                params.registering = false;
            }
        }

        if (!modelAlreadyExists) {
            dtm.log('registering a new model: ' + model.get('name'));
            dtm.modelCallers[model.get('name')] = model.register.caller;
            params.registering = true;
        }

        return model;
    };

    model.save = function () {
        dtm.modelColl[model.get('name')] = model;
        return model;
    };

    model.toNumeric = function (type) {
        switch (type) {
            case 'histo':
            case 'histogram':
                params.process.push({
                    method: function () {
                        if (params.data.get('type') !== 'number') {
                            params.data.histo();
                        }
                    },
                    params: null
                });
                break;
            case 'class':
                params.process.push({
                    method: function () {
                        if (params.data.get('type') !== 'number') {
                            params.data.class();
                        }
                    },
                    params: null
                });
                break;
            case 'freq':
            case 'frequency':
            case 'appearance':
                break;
            default:
                break;
        }
        return model;
    };

    model.domain = function () {
        if (arguments.length === 1) {
            var arg = arguments[0];
            if (typeof(arg) === 'object') {
                if (arg.constructor === Array) {
                    params.domain = arg;
                } else if (isDtmArray(arg)) {
                    if (arg.get('len') === 2) {
                        params.domain = arg.get();
                    } else {
                        params.domain = arg.get('extent');
                    }
                }
            } else if (typeof(arg) === 'function') {
                params.process.push({
                    method: function () {
                        params.domain = arg(params.data);
                    },
                    params: null
                });
            }
        } else if (arguments.length === 2) {
            params.domain = [arguments[0], arguments[1]];
        }
        return model;
    };

    model.range = function () {
        if (arguments.length === 1) {
            var arg = arguments[0];
            if (typeof(arg) === 'object') {
                if (arg.constructor === Array) {
                    params.range = arg;
                } else if (isDtmArray(arg)) {
                    if (arg.get('len') === 2) {
                        params.range = arg.get();
                    } else {
                        params.range = arg.get('extent');
                    }
                }
            } else if (typeof(arg) === 'function') {
                params.process.push({
                    method: function () {
                        params.range = arg(params.data);
                    },
                    params: null
                });
            }
        } else if (arguments.length === 2) {
            params.range = [arguments[0], arguments[1]];
        }
        return model;
    };

    model.output = function (arg) {
        //console.log(model.caller.caller.caller.caller.arguments[0]);
        if (isFunction(arg)) {
            params.output.push({
                method: function (a, c) {
                    return arg(a, c)
                },
                params: null
            });
        } else {
            params.output.push({
                method: function () {
                    return arg;
                },
                params: null
            })
        }
        return model;
    };

    // for instr-type models
    model.start = function () {
        return model;
    };

    model.stop = function () {
        return model;
    };

    model.clone = function () {
        //var m = dtm.model();
        //m.output = clone(model.output);
        //_.forEach(model.setter, function (val, key) {
        //    m.setter[key] = clone(val);
        //});
        //m.modules = clone(model.modules);
        //
        //return m;
        return clone(model);
    };

    model.assignMethods = function (parent) {
        model.mod.forEach(function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        model.param.forEach(function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        model.set.forEach(function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });

        model.map.forEach(function (method, key) {
            parent[key] = method;
            parent.params.push(key);
        });
        return model;
    };

    if (isString(name)) {
        if (!isEmpty(dtm.model.caller)) {
            params.loading = dtm.model.caller.arguments[0];
        }

        var modelLoaded, key;
        for (key in dtm.modelCallers) {
            if (key === name) {
                if (params.loading !== true) {
                    dtm.log('found a registered model: ' + name);
                    modelLoaded = dtm.modelCallers[name](true);
                }
            }
        }

        if (isEmpty(modelLoaded)) {
            for (key in dtm.modelColl) {
                if (key === name && model.load.caller.arguments[0] !== name) {
                    modelLoaded = dtm.modelColl[name].clone();
                }
            }
        }

        if (!isEmpty(modelLoaded)) {
            dtm.log('loading a registered / saved model: ' + name);
            model = modelLoaded;
        }
    } else if (isFunction(name)) {
        params.output.push({
            method: function (a, c) {
                return name(a, c)
            },
            params: null
        });
    }

    //model.load.apply(this, arguments);
    return model;
};

function Model() {

}
dtm.to = dtm.map = function (src, fn) {
    // if (!Data.prototype.trace) {
    //     Data.prototype.trace = true;
    // } // timing issue

    var tgt = src.clone();
    fn(tgt);
    tgt.params.processFn = fn;
    tgt.params.isTarget = true;
    tgt.attach = function (scope, afn) {
        tgt.params.attachedFn = afn.bind(scope);
    };

    src.params.targets[tgt.params.id] = tgt;

    src.params.trace = true;

    // for master to halt tracing processes
    dtm.params.traced.push(src); // TODO: hacky!

    // reset the handler's method interceptor
    src.meta.setInterceptor(function (d, k) {
        if (typeof(d[k]) === 'function' && ['hasOwnProperty', 'clone', 'print', 'plot', 'process'].indexOf(k) === -1) {
            var tracedFn = d[k];
            return function () {
                var args = arguments;
                if (src.params.trace) {
                    objForEach(src.params.targets, function (t) {
                        tracedFn.apply(t, args);

                        var out = t.params.processFn(t);
                        if (isDtmArray(out)) {
                            t.set(out.val);
                        } else if (!isEmpty(out)) {
                            t.set(out);
                        }

                        if (t.params.attachedFn) {
                            t.params.attachedFn(tgt.val);
                        }
                    });
                }
                return tracedFn.apply(this, args);
            }
        } else {
            return d[k];
        }
    });

    return tgt;
};

dtm.to.enable = function (bool) {
    if (!isBoolean(bool)) {
        bool = true;
    }
    Data.prototype.traceGlobal = bool;
    return dtm.to;
};

dtm.to.enable();
/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module synth
 */

///**
// * Creates a new instance of synthesizer object.
// * @function module:synth.synth
// * @returns {dtm.synth}
// */
dtm.synth = function () {
    var synth = function () {
        return synth.clone();
    };

    var params = {
        sr: 44100,
        dur: {
            base: dtm.data([[1]]),
            auto: true
        },
        interval: {
            base: dtm.data([[1]]),
            auto: true
        },
        play: { base: dtm.data([[true]]) },
        offset: 0.0,
        repeat: 1,
        autoRep: true,
        iteration: 0,
        sequence: null,

        onNoteCallback: [],

        interp: 'step',

        baseTime: 0.0, // for offline rendering
        lookahead: false,
        voiceId: Math.random(),
        startTime: 0.0,
        phase: 0.0,
        playing: false,

        wavetable: null,
        rendered: null,
        tabLen: 1024,
        source: 'sine',
        type: 'synth',
        promise: null,
        pending: false,

        amp: { base: dtm.data([[0.5]]) },

        notenum: {
            base: dtm.data([[69]]),
            isFinal: true
        },
        freq: {
            base: dtm.data([[440]]),
            isFinal: false
        },
        pitch: {
            base: dtm.data([[1]]),
            isFinal: false
        },

        pan: { base: dtm.data([[0]]) },
        curve: false,
        offline: false,
        clock: null,

        //useOfflineContext: true,
        rtFxOnly: true,
        named: []
    };

    var nodes = {
        src: null,
        amp: null,
        pan: null,
        out: null,
        fx: [{}],
        pFx: [{}],
        rtSrc: null,

        phasor: null
    };

    synth.meta = {
        type: 'dtm.synth',
        setParams: function (newParams) {
            params = newParams;
            return synth;
        },
        setNodes: function (newNodes) {
            nodes = newNodes;
            return synth;
        }
    };

    /**
     * Returns parameters
     * @function module:synth#get
     * @param param
     * @returns {*}
     */
    synth.get = function (param) {
        switch (param) {
            case 'clock':
                return params.clock;
            case 'lookahead':
                return params.lookahead;
            case 'dur':
            case 'duration':
                return params.dur;
            case 'source':
                return params.source;
            case 'tabLen':
                return params.tabLen;
            case 'wavetable':
                return params.wavetable;
            case 'id':
                return params.voiceId;
            default:
                return synth;
        }
    };

    try {
        if (!!arguments.callee.caller) {
            if (arguments.callee.caller.arguments.length > 0) {
                if (isObject(arguments.callee.caller.arguments[0])) {
                    if (arguments.callee.caller.arguments[0].type === 'dtm.clock') {
                        params.clock = arguments.callee.caller.arguments[0];
                        params.lookahead = true;
                    }
                }
            }
        }
    } catch (e) {

    }


    var actx = dtm.wa.actx;
    var octx = null;
    params.sr = actx.sampleRate;
    params.rtFxOnly = !dtm.wa.useOfflineContext;
    var deferIncr = 1;
    var dummyBuffer = actx.createBuffer(1, 1, 44100);

    // actx.createStereoPanner = null;

    var init = function () {
        if (isFunction(arguments[0])) {
            params.onNoteCallback.push(arguments[0]);
        } else if (isInteger(arguments[0]) && arguments[0] > 0) {
            params.tabLen = arguments[0];
        } else if (isObject(arguments[0])) {
            if (arguments[0].hasOwnProperty('type')) {
                if (arguments[0].type === 'dtm.clock') {
                    params.clock = arguments[0];
                    params.lookahead = true;
                }
            }
        }

        params.baseTime = actx.currentTime;

        // TODO: move this to global (master?)
        params.wavetable = new Float32Array(params.tabLen);
        params.wavetable.forEach(function (v, i) {
            params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
        });
    };

    init.apply(this, arguments); // TODO: there is also synth.load.apply at the bottom!

    function freqToPitch(freq) {
        if (isFloat32Array(freq)) {
            var res = new Float32Array(freq.length);
            freq.forEach(function (v, i) {
                res[i] = v * params.tabLen / params.sr;
            });
            return res;
        } else if (isNumber(freq)) {
            return freq * params.tabLen / params.sr;
        }
    }

    function pitchToFreq(pitchArr) {

    }

    // TODO: remove support for the add and mult
    function processParam(param, seqValue) {
        var tempArr = param.base.get(seqValue).clone();

        // removed the add and mult entries
        // if (!isEmpty(param.add)) {
        //     tempArr.add(param.add.get(seqValue));
        // }
        // if (!isEmpty(param.mult)) {
        //     tempArr.mult(param.mult.get(seqValue));
        // }
        return tempArr.get();
    }

    function setParamCurve (time, dur, curves) {
        curves.forEach(function (curve) {
            // if the curve length exceeds the set duration * this
            var maxDurRatioForSVAT = 0.25;
            if (params.curve || (curve.value.length / params.sr) > (dur * maxDurRatioForSVAT)) {
                curve.param.setValueCurveAtTime(curve.value, time, dur);
            } else {
                // curve.param.setValueCurveAtTime(curve.value, time, dur);
                curve.value.forEach(function (v, i) {
                    curve.param.setValueAtTime(v, time + i / curve.value.length * dur);
                    // for chrome v53.0.2785.116
                    if (i === curve.value.length-1) {
                        curve.param.setValueAtTime(v, time + dur);
                    }
                });
            }

            // curve.param.setValueCurveAtTime(new Float32Array(curve.value), time, dur);
        });
    }

    var fx = {
        // TODO: named param mode not complete
        Gain: function (mode) {
            var name = null;
            var post = isBoolean(mode) ? mode : params.rtFxOnly;
            if (isString(mode)) {
                post = true;
                name = mode;
            }
            this.mult = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.gain = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.gain);
                this.gain.connect(this.out);

                var curves = [];
                curves.push({param: this.gain.gain, value: this.mult});
                setParamCurve(time, dur, curves);

                if (!isEmpty(name)) {
                    params.named[name] = this.gain.gain;
                }
            }
        },

        LPF: function (post) {
            this.freq = new Float32Array([20000.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.lpf = ctx.createBiquadFilter();
                this.out = ctx.createGain();
                this.in.connect(this.lpf);
                this.lpf.connect(this.out);

                var curves = [];
                curves.push({param: this.lpf.frequency, value: this.freq});
                curves.push({param: this.lpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        HPF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.hpf = ctx.createBiquadFilter();
                this.hpf.type = 'highpass';
                this.out = ctx.createGain();
                this.in.connect(this.hpf);
                this.hpf.connect(this.out);

                var curves = [];
                curves.push({param: this.hpf.frequency, value: this.freq});
                curves.push({param: this.hpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        BPF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.bpf = ctx.createBiquadFilter();
                this.bpf.type = 'bandpass';
                this.out = ctx.createGain();
                this.in.connect(this.bpf);
                this.bpf.connect(this.out);

                var curves = [];
                curves.push({param: this.bpf.frequency, value: this.freq});
                curves.push({param: this.bpf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        APF: function (post) {
            this.freq = new Float32Array([30.0]);
            this.q = new Float32Array([1.0]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.apf = ctx.createBiquadFilter();
                this.apf.type = 'allpass';
                this.out = ctx.createGain();
                this.in.connect(this.apf);
                this.apf.connect(this.out);

                var curves = [];
                curves.push({param: this.apf.frequency, value: this.freq});
                curves.push({param: this.apf.Q, value: this.q});
                setParamCurve(time, dur, curves);
            };
        },

        Delay: function (post) {
            this.mix = new Float32Array([0.5]);
            this.time = new Float32Array([0.3]);
            this.feedback = new Float32Array([0.5]);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.delay = ctx.createDelay();
                this.wet = ctx.createGain();
                this.dry = ctx.createGain();
                this.fb = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.delay);
                this.delay.connect(this.fb);
                this.fb.connect(this.delay);
                this.delay.connect(this.wet);
                this.wet.connect(this.out);
                this.in.connect(this.dry);
                this.dry.connect(this.out);

                var curves = [];
                curves.push({param: this.wet.gain, value: this.mix});
                curves.push({param: this.delay.delayTime, value: this.time});
                curves.push({param: this.fb.gain, value: this.feedback});
                setParamCurve(time, dur, curves);
            };
        },

        Reverb: function (post) {
            this.mix = toFloat32Array(0.5);
            //this.time = toFloat32Array(2.0);

            this.run = function (time, dur) {
                var ctx = post ? actx : octx;
                this.in = ctx.createGain();
                this.verb = ctx.createConvolver();
                this.wet = ctx.createGain();
                this.dry = ctx.createGain();
                this.out = ctx.createGain();
                this.in.connect(this.verb);
                this.verb.connect(this.wet);
                this.wet.connect(this.out);
                this.in.connect(this.dry);
                this.dry.connect(this.out);

                // var size = params.sr * 2;
                var size = dtm.wa.buffs.verbIr.length;
                var ir = ctx.createBuffer(1, size, params.sr);
                ir.copyToChannel(dtm.wa.buffs.verbIr.get(), 0);
                this.verb.buffer = ir;

                this.dryLevel = this.mix.map(function (v) {
                    if (v <= 0.5) {
                        return 1.0;
                    } else {
                        return 1.0 - (v - 0.5) * 2.0;
                    }
                });

                this.wetLevel = this.mix.map(function (v) {
                    if (v >= 0.5) {
                        return 1.0;
                    } else {
                        return v * 2.0;
                    }
                });

                var curves = [];
                curves.push({param: this.dry.gain, value: this.dryLevel});
                curves.push({param: this.wet.gain, value: this.wetLevel});
                setParamCurve(time, dur, curves);
            }
        },

        Convolver: function () {

        },

        BitQuantizer: function () {
            this.bit = new Float32Array([16]);
            var self = this;

            this.run = function (time, dur) {
                this.in = actx.createGain();
                this.out = actx.createGain();
                this.in.connect(this.out);

                var interval = dur * params.sr / this.bit.length;
                this.bit.forEach(function (v, i) {
                    // allowing fractional values...
                    if (v > 16) {
                        v = 16;
                    } else if (v < 1) {
                        v = 1;
                    }
                    self.bit[i] = v;
                });

                if (dtm.wa.useOfflineContext) {
                    params.rendered.forEach(function (v, i) {
                        var blockNum = Math.floor(i / interval);
                        if (blockNum > self.bit.length-1) {
                            blockNum = self.bit.length-1;
                        }
                        var res = Math.pow(2, self.bit[blockNum]);
                        params.rendered[i] = Math.round(v * res) / res;
                    });
                } else {
                    params.wavetable.forEach(function (v, i) {
                        var blockNum = Math.floor(i / interval);
                        if (blockNum > self.bit.length-1) {
                            blockNum = self.bit.length-1;
                        }
                        var res = Math.pow(2, self.bit[blockNum]);
                        params.wavetable[i] = Math.round(v * res) / res;
                    });
                }
            };
        },

        SampleHold: function () {
            this.samps = new Float32Array([1]);
            var self = this;

            this.run = function (time, dur) {
                this.in = actx.createGain();
                this.out = actx.createGain();
                this.in.connect(this.out);

                var interval = dur * params.sr / this.samps.length;
                this.samps.forEach(function (v, i) {
                    v = Math.round(v);
                    if (v < 1) {
                        v = 1;
                    }
                    self.samps[i] = v;
                });

                if (dtm.wa.useOfflineContext) {
                    params.rendered.forEach(function (v, i) {
                        var blockNum = Math.floor(i / interval);
                        if (blockNum > self.samps.length - 1) {
                            blockNum = self.samps.length - 1;
                        }
                        var samps = self.samps[blockNum];
                        var hold = 0;
                        if (i % samps === 0) {
                            hold = v;
                        }
                        params.rendered[i] = hold;
                    });
                } else {
                    params.wavetable.forEach(function (v, i) {
                        var blockNum = Math.floor(i / interval);
                        if (blockNum > self.samps.length - 1) {
                            blockNum = self.samps.length - 1;
                        }
                        var samps = self.samps[blockNum];
                        var hold = 0;
                        if (i % samps === 0) {
                            hold = v;
                        }
                        params.wavetable[i] = hold;
                    });
                }
            }
        },

        WaveShaper: function () {

        }
    };

    /**
     * Sets dtm.clock object for internal-use in the synth.
     * @function module:synth#clock
     * @param clock {dtm.clock} dtm.clock object
     * @returns {dtm.synth}
     */
    synth.clock = function (clock) {
        if (isObject(clock)) {
            if (clock.type === 'dtm.clock') {
                params.clock = clock;
            }
        }
        return synth;
    };

    /**
     * @function module:synth#lookahead
     * @param lookahead {bool|number}
     * @returns {dtm.synth}
     */
    synth.lookahead = function (lookahead) {
        if (isBoolean(lookahead)) {
            params.lookahead = lookahead;
        }
        return synth;
    };

    synth.sync = function (input) {
        if (isDtmSynth(input)) {
            synth.interval(input);
            synth.seq(input);
        }
        return synth;
    };

    synth.follow = synth.sync;

    synth.mimic = function (input) {
        if (isDtmSynth(input)) {
            // synth = input();
            synth.interval(input);
            synth.seq(input);
            synth.notenum(input);
            synth.amplitude(input);
            synth.pan(input);
            synth.wavetable(input);
        }
        return synth;
    };

    /**
     * Takes array types with only up to the max depth of 1.
     * @function module:synth#dur
     * @returns {dtm.synth}
     */
    synth.duration = function () {
        var seqValue = params.sequence ? params.sequence[mod(params.iteration, params.sequence.length)] : params.iteration;

        if (arguments.length === 0) {
            if (params.dur.auto) {
                return params.interval.base(seqValue);
            } else {
                return params.dur.base(seqValue);
            }
        }

        var depth = 2;
        var res;
        if (isDtmSynth(arguments[0])) {
            res = arguments[0].duration();
            params.dur.base = check(res, depth) ? convertShallow(res) : params.dur.base;
        } else if (isFunction(arguments[0])) {
            res = arguments[0](params.dur.base, synth, params.clock);
            params.dur.base = check(res, depth) ? convertShallow(res) : params.dur.base;
        } else {
            var argList = argsToArray(arguments);
            params.dur.base = check(argList) ? convertShallow(argList) : params.dur.base;
        }

        params.dur.auto = false;

        return synth;
    };

    synth.interval = function () {
        var depth = 2;

        if (arguments.length === 0) {
            return params.interval.base();
        }

        var res;
        if (isDtmSynth(arguments[0])) {
            res = arguments[0].interval();
            params.interval.base = check(res, depth) ? convertShallow(res) : params.interval.base;
        } else if (isFunction(arguments[0])) {
            res = arguments[0](params.interval.base, synth, params.clock);
            params.interval.base = check(res, depth) ? convertShallow(res) : params.interval.base;
        } else {
            var argList = argsToArray(arguments);
            params.interval.base = check(argList) ? convertShallow(argList) : params.interval.base;
        }

        params.interval.auto = false;

        if (params.dur.auto) {
            params.dur.auto = 'interval';
        }

        return synth;
    };

    synth.interval.freq = function () {
        var depth = 2;

        if (isFunction(arguments[0])) {
            var res = arguments[0](params.interval.base, synth, params.clock);
            params.interval.base = check(res, depth) ? convertShallow(res).reciprocal() : params.interval.base;
        } else {
            var argList = argsToArray(arguments);
            params.interval.base = check(argList) ? convertShallow(argList).reciprocal() : params.interval.base;
        }

        params.interval.auto = false;

        if (params.dur.auto) {
            params.dur.auto = 'interval';
        }

        return synth;
    };

    synth.bpm = function () {
        return synth;
    };

    synth.offset = function (src) {
        params.offset = toFloat32Array(src)[0];
        return synth;
    };

    // maybe not good to have this in synth, instead should be in a model?
    synth.time = function (src) {
        if (isNumber(src) && (src > 0) && !isEmpty(params.clock)) {
            if (mod(params.clock.get('beat'), params.clock.get('time') * src) === 0) {
                // TODO: implement
            }
        }
        return synth;
    };

    /**
     * Plays
     * @function module:synth#play
     * @returns {dtm.synth}
     */
    synth.play = function (fn) {
        if (isFunction(fn)) {
            params.onNoteCallback.push(fn);
        }

        var defer = 0.01;
        if (params.lookahead) {
            defer = Math.round(params.clock.get('lookahead') * 500);
        }

        // if playSwitch is a function

        if (params.pending) {
            params.pending = false;
            params.promise.then(function () {
                synth.play();
                return synth;
            });
            return synth;
        }

        // TODO: use promise-all rather than deferring
        // deferred
        setTimeout(function () {
            var seqValue = params.sequence ? params.sequence[mod(params.iteration, params.sequence.length)] : params.iteration;

            // TODO: use promise
            params.onNoteCallback.forEach(function (fn) {
                fn(synth, seqValue, params.clock);
            });

            var amp = processParam(params.amp, seqValue);
            var pan = processParam(params.pan, seqValue);
            var pitch;

            if (params.notenum.isFinal) {
                pitch = processParam(params.notenum, seqValue).map(function (v) {
                    return freqToPitch(mtof(v));
                });
            } else if (params.freq.isFinal) {
                pitch = processParam(params.freq, seqValue).map(function (v) {
                    return freqToPitch(v);
                });
            } else {
                pitch = processParam(params.pitch, seqValue);
            }

            var interval, dur;

            if (params.interval.auto && params.clock) {
                interval = params.clock.get('interval');
            } else {
                interval = processParam(params.interval, seqValue)[0];
            }

            if (interval <= 0) {
                interval = 0;
            }

            if (params.dur.auto && interval !== 0) {
                if (params.dur.auto === 'sample') {
                    params.tabLen = params.wavetable.length;

                    dur = 0;
                    pitch.forEach(function (v) {
                        dur += params.tabLen / params.sr / v / pitch.length;
                    });
                } else {
                    dur = interval;
                }
            } else {
                dur = processParam(params.dur, seqValue)[0];
            }

            if (dur <= 0) {
                dur = 0.001;
            }

            var offset = params.offset;
            var curves;

            dtm.master.addVoice(synth);

            //===============================
            if (dtm.wa.useOfflineContext) {
                octx = new OfflineAudioContext(1, (offset + dur*4) * params.sr, params.sr);

                offset += octx.currentTime;

                if (params.lookahead) {
                    offset += params.clock.get('lookahead');
                }

                nodes.src = octx.createBufferSource();
                nodes.amp = octx.createGain();
                nodes.out = octx.createGain();
                nodes.fx[0].out = octx.createGain();
                nodes.src.connect(nodes.amp);
                nodes.amp.connect(nodes.fx[0].out);
                nodes.out.connect(octx.destination);

                for (var n = 1; n < nodes.fx.length; n++) {
                    nodes.fx[n].run(offset, dur);
                    nodes.fx[n-1].out.connect(nodes.fx[n].in);
                }
                nodes.fx[n-1].out.connect(nodes.out);

                if (params.source === 'noise') {
                    nodes.src.buffer = octx.createBuffer(1, params.sr/2, params.sr);
                    var chData = nodes.src.buffer.getChannelData(0);
                    chData.forEach(function (v, i) {
                        chData[i] = Math.random() * 2.0 - 1.0;
                    });
                    nodes.src.loop = true;
                } else {
                    nodes.src.buffer = octx.createBuffer(1, params.tabLen, params.sr);
                    nodes.src.buffer.copyToChannel(params.wavetable, 0);
                    nodes.src.loop = true;
                }

                curves = [];
                curves.push({param: nodes.src.playbackRate, value: pitch});
                curves.push({param: nodes.amp.gain, value: amp});
                setParamCurve(offset, dur, curves);

                nodes.fx[0].out.gain.value = 1.0;
                nodes.out.gain.value = 0.3;

                nodes.src.start(offset);
                nodes.src.stop(offset + dur);

                octx.startRendering();
                octx.oncomplete = function (e) {
                    params.rendered = e.renderedBuffer.getChannelData(0);

                    offset += params.baseTime;
                    if (params.lookahead) {
                        offset += params.clock.get('lookahead');
                    }

                    nodes.rtSrc = actx.createBufferSource();
                    nodes.pFx[0].out = actx.createGain();
                    nodes.pan = actx.createStereoPanner();
                    var out = actx.createGain();
                    nodes.rtSrc.connect(nodes.pFx[0].out);
                    for (var n = 1; n < nodes.pFx.length; n++) {
                        nodes.pFx[n].run(offset, dur);
                        nodes.pFx[n-1].out.connect(nodes.pFx[n].in);
                    }
                    nodes.pFx[n-1].out.connect(nodes.pan);
                    nodes.pan.connect(out);
                    out.connect(actx.destination);

                    nodes.rtSrc.buffer = actx.createBuffer(1, params.rendered.length, params.sr);
                    nodes.rtSrc.buffer.copyToChannel(params.rendered, 0);
                    nodes.rtSrc.loop = false;
                    nodes.rtSrc.start(offset);
                    nodes.rtSrc.stop(offset + nodes.rtSrc.buffer.length);

                    setParamCurve(offset, dur, [{param: nodes.pan.pan, value: pan}]);

                    out.gain.value = 1.0;

                    nodes.rtSrc.onended = function () {
                        dtm.master.removeVoice(synth);

                        if (params.repeat > 1) {
                            synth.play(); // TODO: pass any argument?
                            params.repeat--;
                        }
                    };
                };
            } else {
                offset += actx.currentTime;

                if (params.lookahead) {
                    offset += params.clock.get('lookahead');
                }

                params.startTime = offset;

                nodes.src = actx.createBufferSource();
                nodes.amp = actx.createGain();
                nodes.pFx[0].out = actx.createGain();

                if (actx.createStereoPanner) {
                    nodes.pan = actx.createStereoPanner();
                } else {
                    nodes.left = actx.createGain();
                    nodes.right = actx.createGain();
                    nodes.merger = actx.createChannelMerger(2);
                }

                var declipper = actx.createGain();
                var out = actx.createGain();
                nodes.src.connect(nodes.amp);
                nodes.amp.connect(declipper);
                declipper.connect(nodes.pFx[0].out);
                for (var n = 1; n < nodes.pFx.length; n++) {
                    nodes.pFx[n].run(offset, dur);
                    nodes.pFx[n-1].out.connect(nodes.pFx[n].in);
                }

                if (actx.createStereoPanner) {
                    nodes.pFx[n-1].out.connect(nodes.pan);
                    nodes.pan.connect(out);
                } else {
                    nodes.pFx[n-1].out.connect(nodes.left);
                    nodes.pFx[n-1].out.connect(nodes.right);
                    nodes.left.connect(nodes.merger, 0, 0);
                    nodes.right.connect(nodes.merger, 0, 1);
                    nodes.merger.connect(out);
                }
                out.connect(actx.destination);

                var dummySrc = actx.createBufferSource();
                dummySrc.buffer = dummyBuffer;
                dummySrc.loop = true;
                var silence = actx.createGain();
                silence.gain.value = 1;
                dummySrc.connect(silence);
                silence.connect(out);

                var tempBuff = actx.createBuffer(1, params.tabLen, params.sr); // FF needs this stupid procedure of storing to a variable (Feb 18, 2016)
                if (tempBuff.copyToChannel) {
                    // for Safari
                    tempBuff.copyToChannel(params.wavetable, 0);
                } else {
                    var tempTempBuff = tempBuff.getChannelData(0);
                    tempTempBuff.forEach(function (v, i) {
                        tempTempBuff[i] = params.wavetable[i];
                    });
                }
                nodes.src.buffer = tempBuff;
                nodes.src.loop = (params.type !== 'sample');

                // onended was sometimes not getting registered before src.start for some reason
                var p = new Promise(function (resolve) {
                    dummySrc.onended = function () {
                        if (interval >= dur) {
                            dtm.master.removeVoice(synth);
                        }

                        // rep(1) would only play once
                        if (params.repeat > 1) {
                            synth.play(); // TODO: pass any argument?
                            params.repeat--;
                        }
                    };

                    nodes.src.onended = function () {
                        if (dur > interval) {
                            dtm.master.removeVoice(synth);
                        }
                        params.playing = false;
                    };

                    resolve();
                });

                p.then(function () {
                    dummySrc.start(offset);
                    dummySrc.stop(offset + interval);
                    nodes.src.start(offset + 0.00001);
                    nodes.src.stop(offset + dur + 0.00001);

                    // ignoring start offset for now
                    // need a timer
                    params.playing = true;
                });

                curves = [];
                curves.push({param: nodes.src.playbackRate, value: pitch});
                curves.push({param: nodes.amp.gain, value: amp});
                setParamCurve(offset, dur, curves);

                if (actx.createStereoPanner) {
                    setParamCurve(offset, dur, [{param: nodes.pan.pan, value: pan}]);
                } else {
                    var left = pan.map(function (v) {
                        if (v < 0) {
                            return 0.5;
                        } else {
                            return 0.5 - v*0.5;
                        }
                    });

                    var right = pan.map(function (v) {
                        if (v < 0) {
                            return 0.5 + v*0.5;
                        } else {
                            return 0.5;
                        }
                    });
                    setParamCurve(offset, dur, [{param: nodes.left.gain, value: left}]);
                    setParamCurve(offset, dur, [{param: nodes.right.gain, value: right}]);
                }

                nodes.pFx[0].out.gain.value = 1.0; // ?
                out.gain.value = 1.0;

                var ramp = 0.005;
                declipper.gain.setValueAtTime(0.0, offset);
                declipper.gain.linearRampToValueAtTime(1.0, offset + ramp);
                declipper.gain.setTargetAtTime(0.0, offset + dur - ramp, ramp * 0.3);
            }

            params.iteration++;

        }, defer + deferIncr);

        return synth;
    };

    synth.trigger = function () {
        synth.mute();
        synth.play.apply(this, arguments);
        return synth;
    };

    synth.t = synth.tr = synth.trig = synth.trigger;

    synth.run = function () {
        synth.mute().rep();
        synth.play.apply(this, arguments);
        return synth;
    };

    synth.start = function () {
        synth.rep();
        synth.play.apply(this, arguments);
        return synth;
    };

    // bad name
    synth.iter = function (val) {
        if (isInteger(val)) {
            params.iteration = val;
        }
        return params.iteration;
    };

    synth.incr = synth.iter;

    // set order of the iteration
    synth.seq = function (input) {
        if (input === 'reset' || input === 'clear' || input === []) {
            params.sequence = null;
        }

        if (isDtmSynth(input)) {
            params.sequence = [input.seq()];
        } else if (argsAreSingleVals(arguments) && arguments.length > 1) {
            if (isNumOrFloat32Array(argsToArray(arguments))) {
                params.sequence = argsToArray(arguments);
            }
        } else if (isNumber(input)) {
            params.sequence = [input];
        } else if (isNumOrFloat32Array(input)) {
            params.sequence = input;
        } else if (isNumDtmArray(input)) {
            params.sequence = input.get();
        } else {
            return params.sequence ? params.sequence[mod(params.iteration, params.sequence.length)] : params.iteration;
        }

        return synth;
    };

    synth.sequence = synth.seq;

    // lazy-eval
    synth.onnote = function (fn) {
        if (isFunction(fn)) {
            params.onNoteCallback.push(fn);
        }
        return synth;
    };

    // this is stupid
    synth.each = synth.do = synth.call = synth.onnote;

    // testing
    synth.cancel = function (time) {
        if (!isNumber(time)) {
            time = 0.0;
        }

        objForEach(params.named, function (p) {
            p.cancelScheduledValues(actx.currentTime + time);
        });

        return synth;
    };

    /**
     * Stops the currently playing sound.
     * @function module:synth#stop
     * @param [time=0] {number} Delay in seconds for the stop action to be called.
     * @returns {dtm.synth}
     */
    synth.stop = function (time) {
        var defer = 0.0;
        if (params.lookahead) {
            defer = Math.round(params.clock.get('lookahead') * 500);
        }

        if (!isNumber(time)) {
            time = 0.0; // TODO: time not same as rt rendering time
        }

        params.repeat = 0;

        setTimeout(function () {
            if (nodes.src) {
                nodes.src.stop(time);
            }

            if (nodes.rtSrc) {
                nodes.rtSrc.stop(time);
            }

            dtm.master.removeVoice(synth);
        }, defer + deferIncr*2);

        return synth;
    };

    synth.repeat = function (times, interval) {
        if (isInteger(times) && times > 0) {
            params.repeat = times;
        } else if (isEmpty(times) || times === Infinity || times === true) {
            params.repeat = Infinity;
        }
        return synth;
    };
    
    function getPhase() {
        params.phase = (actx.currentTime - params.startTime) / params.dur.base(synth.seq()).get(0);
        if (params.phase < 0.0) {
            params.phase = 0.0;
        } else if (params.phase > 1.0) {
            params.phase = 1.0;
        }
        return params.phase;
    }

    synth.phase = function () {
        return getPhase();
    };

    synth.mute = function () {
        synth.gain(0);
        return synth;
    };

    synth.mod = function (name, val) {
        if (isString(name) && params.named.hasOwnProperty(name)) {
            setTimeout(function () {
                params.named[name].cancelScheduledValues(0); // TODO: check
                params.named[name].setValueAtTime(val, 0);
            }, 0);
        }
        return synth;
    };

    synth.modulate = synth.mod;

    function setFinal(param) {
        ['notenum', 'freq', 'pitch'].forEach(function (v) {
            params[v].isFinal = v === param;
        });
    }

    /**
     * Sets the frequency of the oscillator
     * @function module:synth#freq
     * @returns {dtm.synth}
     */
    synth.frequency = function () {
        var seqValue = params.sequence ? params.sequence[mod(params.iteration, params.sequence.length)] : params.iteration;

        if (arguments.length === 0) {
            return params.freq.base(seqValue);
        } else if (isDtmSynth(arguments[0])) {
            return synth.frequency(arguments[0].freq());
        }
        mapParam(arguments, params.freq);
        setFinal('freq');

        return synth;
    };

    /**
     * Sets the pitch of the oscillator by a MIDI note number.
     * @function module:synth#notenum
     * @returns {dtm.synth}
     */
    synth.notenum = function () {
        var seqValue = params.sequence ? params.sequence[mod(params.iteration, params.sequence.length)] : params.iteration;

        if (arguments.length === 0) {
            return params.notenum.base(seqValue);
        } else if (isDtmSynth(arguments[0])) {
            return synth.notenum(arguments[0].notenum());
        }
        mapParam(arguments, params.notenum);
        setFinal('notenum');

        if (params.playing) {
            nodes.src.playbackRate.cancelScheduledValues(params.startTime);
            var pitch = processParam(params.notenum, seqValue).map(function (v) {
                return freqToPitch(mtof(v));
            });
            var dur = processParam(params.dur, seqValue)[0];
            setParamCurve(params.startTime, dur, [{param: nodes.src.playbackRate, value: pitch}]);
        }

        return synth;
    };

    // for longer sample playback
    synth.pitch = function () {
        var seqValue = params.sequence ? params.sequence[mod(params.iteration, params.sequence.length)] : params.iteration;

        if (arguments.length === 0) {
            return params.pitch.base(seqValue);
        } else if (isDtmSynth(arguments[0])) {
            return synth.pitch(arguments[0].pitch());
        }

        mapParam(arguments, params.pitch);
        setFinal('pitch');
        return synth;
    };

    /**
     * @function module:synth#amp
     * @returns {dtm.synth}
     */
    synth.amplitude = function () {
        var seqValue = params.sequence ? params.sequence[mod(params.iteration, params.sequence.length)] : params.iteration;

        if (arguments.length === 0) {
            return params.amp.base(seqValue);
        } else if (isDtmSynth(arguments[0])) {
            // TODO: will be muted when the parent is triggering / running
            // should fix and use gain intead
            return synth.amplitude(arguments[0].amp());
        }

        mapParam(arguments, params.amp);
        return synth;
    };

    /**
     * @function module:synth#pan
     * @returns {dtm.synth}
     */
    synth.pan = function () {
        var seqValue = params.sequence ? params.sequence[mod(params.iteration, params.sequence.length)] : params.iteration;

        if (arguments.length === 0) {
            return params.pan.base(seqValue);
        } else if (isDtmSynth(arguments[0])) {
            return synth.pan(arguments[0].pan());
        }

        mapParam(arguments, params.pan);
        return synth;
    };

    synth.ts = function (src) {
        return synth;
    };

    synth.ps = function (src) {
        return synth;
    };

    synth.wavetable = function (src) {
        if (arguments.length === 0) {
            return dtm.data(params.wavetable);
        } else if (isDtmSynth(arguments[0])) {
            return synth.wavetable(arguments[0].wavetable());
        }

        src = typeCheck(src);
        if (isFloat32Array(src)) {
            // params.tabLen = src.length; // for the morphing / in-note modulation
            if (params.tabLen !== src.length) {
                params.wavetable = dtm.data(src).step(params.tabLen).get();
            } else {
                params.wavetable = src;
            }
            //params.pitch = freqToPitch(params.freq); // ?
        } else if (isFunction(src)) {
            if (params.promise) {
                params.promise.then(function () {
                    params.wavetable = toFloat32Array(src(dtm.data(params.wavetable)));
                });
            } else {
                params.wavetable = toFloat32Array(src(dtm.data(params.wavetable)));
                params.tabLen = params.wavetable.length;
                //params.pitch = freqToPitch(params.freq); // ?
            }
        } else {
            params.wavetable = new Float32Array(params.tabLen);
            params.wavetable.forEach(function (v, i) {
                params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
            });
        }

        if (params.playing) {
            if (params.wavetable.length !== params.tabLen) {
                params.wavetable = dtm.data(params.wavetable).step(params.tabLen).get();
            }
            if (nodes.src.buffer.copyToChannel) {
                // for Safari
                nodes.src.buffer.copyToChannel(params.wavetable, 0);
            } else {
                var tempBuff = nodes.src.buffer.getChannelData(0);
                tempBuff.forEach(function (v, i) {
                    tempBuff[i] = params.wavetable[i];
                });
            }
        }

        return synth;
    };

    synth.w = synth.wt = synth.wave = synth.wavetable;

    synth.len = function (val) {
        if (isInteger(val) && val > 0) {
            params.tabLen = val;

            // TODO: move this to global (master?)
            // also check in init()
            params.wavetable = new Float32Array(params.tabLen);
            params.wavetable.forEach(function (v, i) {
                params.wavetable[i] = Math.sin(2 * Math.PI * i / params.tabLen);
            });
        }
        return synth;
    };

    synth.size = synth.len;

    synth.source = function (src) {
        if (isString(src)) {
            params.source = src;
        }

        return synth;
    };

    synth.load = function (name) {
        if (name === 'noise') {
            params.wavetable = dtm.gen('noise').size(44100).get();
            synth.freq(1);

        } else if (isString(name)) {
            params.pending = true;
            params.source = name;
            params.type = 'sample';
            synth.pitch(1);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', name, true);
            xhr.responseType = 'arraybuffer';
            params.promise = new Promise(function (resolve) {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        actx.decodeAudioData(xhr.response, function (buf) {
                            params.wavetable = buf.getChannelData(0);

                            if (params.dur.auto) {
                                params.dur.auto = 'sample';
                            }
                            resolve(synth);
                        });
                    }
                };
            });

            xhr.send();
        }
        //else if (arg.constructor.name === 'ArrayBuffer') {
        //    actx.decodeAudioData(arg, function (buf) {
        //        params.buffer = buf;
        //        resolve(synth);
        //
        //        if (typeof(cb) !== 'undefined') {
        //            cb(synth);
        //        }
        //    });
        //} else if (arg.constructor === Array) {
        //    var buf = actx.createBuffer(1, arg.length, dtm.wa.actx.sampleRate);
        //    var content = buf.getChannelData(0);
        //    content.forEach(function (val, idx) {
        //        content[idx] = arg[idx];
        //    });
        //
        //    params.buffer = buf;
        //    resolve(synth);
        //
        //    if (typeof(cb) !== 'undefined') {
        //        cb(synth);
        //    }
        //}
        return synth;
    };

    /**
     * @function module:synth#gain
     * @param mult
     * @param post
     * @returns {dtm.synth}
     */
    synth.gain = function (mult, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var gain = new fx.Gain(post);

        mult = typeCheck(mult);
        if (mult) {
            gain.mult = mult;
        }

        if (post) {
            nodes.pFx.push(gain);
        } else {
            nodes.fx.push(gain);
        }
        return synth;
    };

    /**
     * @function module:synth#lpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.lpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var lpf = new fx.LPF(post);

        freq = typeCheck(freq);
        if (freq) {
            lpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            lpf.q = q;
        }

        if (post) {
            nodes.pFx.push(lpf);
        } else {
            nodes.fx.push(lpf);
        }
        return synth;
    };

    synth.lpf.post = function (freq, q) {
        var lpf = new fx.LPF(true);

        freq = typeCheck(freq);
        if (freq) {
            lpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            lpf.q = q;
        }

        nodes.pFx.push(lpf);

        return synth;
    };

    /**
     * @function module:synth#hpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.hpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var hpf = new fx.HPF(post);

        freq = typeCheck(freq);
        if (freq) {
            hpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            hpf.q = q;
        }

        if (post) {
            nodes.pFx.push(hpf);
        } else {
            nodes.fx.push(hpf);
        }
        return synth;
    };

    /**
     * @function module:synth#bpf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.bpf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var bpf = new fx.BPF(post);

        freq = typeCheck(freq);
        if (freq) {
            bpf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            bpf.q = q;
        }

        if (post) {
            nodes.pFx.push(bpf);
        } else {
            nodes.fx.push(bpf);
        }
        return synth;
    };

    /**
     * @function module:synth#apf
     * @param freq
     * @param q
     * @param post
     * @returns {dtm.synth}
     */
    synth.apf = function (freq, q, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var apf = new fx.APF(post);

        freq = typeCheck(freq);
        if (freq) {
            apf.freq = freq;
        }

        q = typeCheck(q);
        if (q) {
            apf.q = q;
        }

        if (post) {
            nodes.pFx.push(apf);
        } else {
            nodes.fx.push(apf);
        }
        return synth;
    };

    /**
     * @function module:synth#delay
     * @param mix
     * @param time
     * @param feedback
     * @param post
     * @returns {dtm.synth}
     */
    synth.delay = function (mix, time, feedback, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var delay = new fx.Delay(post);

        mix = typeCheck(mix);
        if (mix) {
            delay.mix = mix;
        }

        time = typeCheck(time);
        if (time) {
            delay.time = time;
        }

        feedback = typeCheck(feedback);
        if (feedback) {
            delay.feedback = feedback;
        }

        if (post) {
            nodes.pFx.push(delay);
        } else {
            nodes.fx.push(delay);
        }
        return synth;
    };

    synth.reverb = function (mix, post) {
        post = isBoolean(post) ? post : params.rtFxOnly;
        var verb = new fx.Reverb(post);

        mix = typeCheck(mix);
        if (mix) {
            verb.mix = mix;
        }

        if (post) {
            nodes.pFx.push(verb);
        } else {
            nodes.fx.push(verb);
        }
        return synth;
    };

    synth.verb = synth.reverb;

    synth.conv = function (src) {
        return synth;
    };

    synth.waveshape = function (src) {
        return synth;
    };

    /**
     * @function module:synth#bq
     * @param bit
     * @returns {dtm.synth}
     */
    synth.bq = function (bit) {
        var bq = new fx.BitQuantizer();

        bit = typeCheck(bit);
        if (bit) {
            bq.bit = bit;
        }
        nodes.pFx.push(bq);
        return synth;
    };

    /**
     * @see {@link module:synth#bq}
     * @type {synth.bq|*}
     */
    synth.bitquantize = synth.bq;

    /**
     * @function module:synth#sh | samphold | samplehold
     * @param samps
     * @returns {dtm.synth}
     */
    synth.sh = function (samps) {
        var sh = new fx.SampleHold();

        samps = typeCheck(samps);
        if (samps) {
            sh.samps = samps;
        }
        nodes.pFx.push(sh);
        return synth;
    };

    synth.samplehold = synth.samphold = synth.sh;

    function typeCheck(src) {
        if (isNestedDtmArray(src)) {
            //return toFloat32Array(src);
            return src;
        } else if (isFunction(src)) {
            //return deferCallback(src);
            return src;
        } else {
            return toFloat32Array(src);
        }
    }

    function check(src, depth) {
        if (!isInteger(depth)) {
            depth = 3;
        }
        return isNumber(src) ||
            ((isNumArray(src) ||
            isNestedArray(src) ||
            isNestedWithDtmArray(src) ||
            isNumOrFloat32Array(src) ||
            isNumDtmArray(src) ||
            isNestedNumDtmArray(src)) && getMaxDepth(src) <= depth);
    }

    function convert(src) {
        if (isArray(src) && src.length === 1) {
            return convert(src[0]);
        } else {
            if (isNestedNumDtmArray(src)) {
                return src;
            } else if (isNestedWithDtmArray(src)) {
                return dtm.data(src);
            } else if (isNumDtmArray(src)) {
                return dtm.data([src]);
            } else if (isNestedArray(src)) {
                return dtm.data(src);
            } else if (isNumOrFloat32Array(src)) {
                return dtm.data([src]);
            } else {
                return dtm.data([toFloat32Array(src)]);
            }
        }
    }

    function convertShallow(src) {
        if (isArray(src) && src.length === 1) {
            return convertShallow(src[0]);
        } else {
            if (isNestedNumDtmArray(src)) {
                return src;
            } else if (isNestedWithDtmArray(src)) {
                return dtm.data.apply(this, src);
            } else if (isNumDtmArray(src)) {
                return src().block(1);
            } else if (isNestedArray(src)) {
                return dtm.data(src);
            } else if (isNumOrFloat32Array(src)) {
                return dtm.data(src).block(1);
            } else {
                return dtm.data([toFloat32Array(src)]);
            }
        }
    }

    function mapParam(args, param, mod) {
        var res, argList;

        if (mod === 'base' || typeof(mod) === 'undefined') {
            if (isFunction(args[0])) {
                res = args[0](param['base'], synth, params.clock);
                param['base'] = check(res) ? convert(res) : param;
            } else {
                argList = argsToArray(args);
                param['base'] = check(argList) ? convert(argList) : param;
            }
        }

        // disabled synth.param.add / .mult interfaces
        // else {
        //     if (isEmpty(param[mod])) {
        //         if (isFunction(args[0])) {
        //             res = args[0](param['base'], synth, params.clock);
        //             param[mod] = check(res) ? convert(res) : param;
        //         } else {
        //             argList = argsToArray(args);
        //             param[mod] = check(argList) ? convert(argList) : param;
        //         }
        //     } else {
        //         if (isFunction(args[0])) {
        //             res = args[0](param[mod], synth, params.clock);
        //             param[mod] = check(res) ? convert(res) : param;
        //         } else {
        //             argList = argsToArray(args);
        //             param[mod][mod](check(argList) ? convert(argList) : param);
        //         }
        //     }
        // }
    }

    function mapParamShallow() {

    }

    // TODO: return value type not consistent!
    /**
     * @function module:synth#get
     * @param param
     * @returns {*}
     */
    synth.get = function (param) {
        switch (param) {
            case 'wt':
            case 'wavetable':
                return dtm.data(params.wavetable);
            case 'dur':
                return dtm.data(params.dur);
            case 'phase':
                return getPhase();
            case 'nn':
            case 'notenum':
                return dtm.data(params.notenum);
            case 'freq':
            case 'frequency':
                return dtm.data(params.freq);
            case 'pitch':
                return dtm.data(params.pitch);
            case 'fx':
                return nodes.fx;

            case 'samplerate':
            case 'sr':
            case 'fs':
                return params.sr;

            case 'numsamps':
                return Math.round(params.sr * params.dur);

            default:
                return synth;
        }
    };

    synth.clone = function () {
        var newParams = {};

        try {
            objForEach(params, function (v, k) {
                if (['amp', 'notenum', 'freq', 'pitch', 'pan'].indexOf(k) > -1) {
                    newParams[k] = {};
                    newParams[k].base = v.base.clone();
                    newParams[k].add = isDtmArray(v.add) ? v.add.clone() : undefined;
                    newParams[k].mult = isDtmArray(v.mult) ? v.mult.clone() : undefined;
                    newParams[k].isFinal = v.isFinal;
                } else {
                    newParams[k] = v;
                }
            });
        } catch (e) {
            console.log(e);
        }

        newParams.voiceId = Math.random();
        return dtm.synth().meta.setParams(newParams);
    };
    
    ['play', 'stop', 'run', 'interval', 'duration', 'repeat', 'amplitude', 'frequency', 'notenum', 'pitch'].forEach(function (name) {
        if (name in alias) {
            alias[name].forEach(function (v) {
                synth[v] = synth[name];
            });
        }
    });

    // ['interval', 'duration'].forEach(function (param) {
    //     ['frequency'].forEach(function (name) {
    //         if (param in alias) {
    //             alias[param].forEach(function (v) {
    //                 synth[param][name][v] = ;
    //             });
    //         }
    //     });
    // });

    synth.load.apply(this, arguments);
    return synth;
};

dtm.s = dtm.syn = dtm.synth;

dtm.startWebAudio();

/**
 * @fileOverview Some building blocks for model creation. It can be used as one-shot as well.
 * @module music
 */

///**
// * Creates a new instance of synthesizer object.
// * @function module:music.music
// * @returns {dtm.music}
// */
dtm.m = dtm.music = function () {
    var music = new Music();
    return music.init.apply(music, arguments);
};

dtm.music.offline = function (bool) {
    if (isBoolean(bool)) {
        Music.prototype.offline = bool;
    } else if (isEmpty(bool)) {
        Music.prototype.offline = true;
    }
};

var fx = {
    // TODO: named param mode not complete
    Gain: function (self, mode) {
        var name = null;
        var post = isBoolean(mode) ? mode : self.params.rtFxOnly;
        if (isString(mode)) {
            post = true;
            name = mode;
        }
        this.mult = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.gain = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.gain);
            this.gain.connect(this.out);

            var curves = [];
            curves.push({param: this.gain.gain, value: this.mult});
            self.setParamCurve(time, dur, curves);

            if (!isEmpty(name)) {
                self.params.named[name] = this.gain.gain;
            }
        }
    },

    LPF: function (self, post) {
        this.freq = new Float32Array([20000.0]);
        this.q = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.lpf = ctx.createBiquadFilter();
            this.out = ctx.createGain();
            this.in.connect(this.lpf);
            this.lpf.connect(this.out);

            var curves = [];
            curves.push({param: this.lpf.frequency, value: this.freq});
            curves.push({param: this.lpf.Q, value: this.q});
            self.setParamCurve(time, dur, curves);
        };
    },

    HPF: function (self, post) {
        this.freq = new Float32Array([30.0]);
        this.q = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.hpf = ctx.createBiquadFilter();
            this.hpf.type = 'highpass';
            this.out = ctx.createGain();
            this.in.connect(this.hpf);
            this.hpf.connect(this.out);

            var curves = [];
            curves.push({param: this.hpf.frequency, value: this.freq});
            curves.push({param: this.hpf.Q, value: this.q});
            self.setParamCurve(time, dur, curves);
        };
    },

    BPF: function (self, post) {
        this.freq = new Float32Array([30.0]);
        this.q = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.bpf = ctx.createBiquadFilter();
            this.bpf.type = 'bandpass';
            this.out = ctx.createGain();
            this.in.connect(this.bpf);
            this.bpf.connect(this.out);

            var curves = [];
            curves.push({param: this.bpf.frequency, value: this.freq});
            curves.push({param: this.bpf.Q, value: this.q});
            self.setParamCurve(time, dur, curves);
        };
    },

    APF: function (self, post) {
        this.freq = new Float32Array([30.0]);
        this.q = new Float32Array([1.0]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.apf = ctx.createBiquadFilter();
            this.apf.type = 'allpass';
            this.out = ctx.createGain();
            this.in.connect(this.apf);
            this.apf.connect(this.out);

            var curves = [];
            curves.push({param: this.apf.frequency, value: this.freq});
            curves.push({param: this.apf.Q, value: this.q});
            self.setParamCurve(time, dur, curves);
        };
    },

    Delay: function (self, post) {
        this.mix = new Float32Array([0.5]);
        this.time = new Float32Array([0.3]);
        this.feedback = new Float32Array([0.5]);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.delay = ctx.createDelay();
            this.wet = ctx.createGain();
            this.dry = ctx.createGain();
            this.fb = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.delay);
            this.delay.connect(this.fb);
            this.fb.connect(this.delay);
            this.delay.connect(this.wet);
            this.wet.connect(this.out);
            this.in.connect(this.dry);
            this.dry.connect(this.out);

            var curves = [];
            curves.push({param: this.wet.gain, value: this.mix});
            curves.push({param: this.delay.delayTime, value: this.time});
            curves.push({param: this.fb.gain, value: this.feedback});
            self.setParamCurve(time, dur, curves);
        };
    },

    Reverb: function (self, post) {
        this.mix = toFloat32Array(0.5);
        //this.time = toFloat32Array(2.0);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.verb = ctx.createConvolver();
            this.wet = ctx.createGain();
            this.dry = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.verb);
            this.verb.connect(this.wet);
            this.wet.connect(this.out);
            this.in.connect(this.dry);
            this.dry.connect(this.out);

            // var size = self.params.sr * 2;
            var size = Music.prototype.verbIr.length;
            var ir = ctx.createBuffer(1, size, self.params.sr);
            ir.copyToChannel(Music.prototype.verbIr.get(), 0);
            this.verb.buffer = ir;

            this.dryLevel = this.mix.map(function (v) {
                if (v <= 0.5) {
                    return 1.0;
                } else {
                    return 1.0 - (v - 0.5) * 2.0;
                }
            });

            this.wetLevel = this.mix.map(function (v) {
                if (v >= 0.5) {
                    return 1.0;
                } else {
                    return v * 2.0;
                }
            });

            var curves = [];
            curves.push({param: this.dry.gain, value: this.dryLevel});
            curves.push({param: this.wet.gain, value: this.wetLevel});
            self.setParamCurve(time, dur, curves);
        }
    },

    Convolver: function (self, post) {
        this.mix = toFloat32Array(1);
        this.tgt = toFloat32Array(1);

        this.run = function (time, dur) {
            var ctx = post ? Music.prototype.actx : Music.prototype.octx;
            this.in = ctx.createGain();
            this.conv = ctx.createConvolver();
            this.wet = ctx.createGain();
            this.dry = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.conv);
            this.conv.connect(this.wet);
            this.wet.connect(this.out);
            this.in.connect(this.dry);
            this.dry.connect(this.out);

            var size = this.tgt.length;
            var tgt = ctx.createBuffer(1, size, self.params.sr);
            tgt.copyToChannel(this.tgt, 0);
            this.conv.buffer = tgt;

            this.dryLevel = this.mix.map(function (v) {
                if (v <= 0.5) {
                    return 1.0;
                } else {
                    return 1.0 - (v - 0.5) * 2.0;
                }
            });

            this.wetLevel = this.mix.map(function (v) {
                if (v >= 0.5) {
                    return 1.0;
                } else {
                    return v * 2.0;
                }
            });

            var curves = [];
            curves.push({param: this.dry.gain, value: this.dryLevel});
            curves.push({param: this.wet.gain, value: this.wetLevel});
            self.setParamCurve(time, dur, curves);
        }
    },

    BitQuantizer: function (self) {
        this.bit = new Float32Array([16]);
        var that = this;

        this.run = function (time, dur) {
            var ctx = Music.prototype.actx;
            this.in = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.out);

            var interval = dur * self.params.sr / this.bit.length;
            this.bit.forEach(function (v, i) {
                // allowing fractional values...
                if (v > 16) {
                    v = 16;
                } else if (v < 1) {
                    v = 1;
                }
                that.bit[i] = v;
            });

            if (Music.prototype.offline) {
                self.params.rendered.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.bit.length - 1) {
                        blockNum = that.bit.length - 1;
                    }
                    var res = Math.pow(2, that.bit[blockNum]);
                    self.params.rendered[i] = Math.round(v * res) / res;
                });
            } else {
                self.params.wavetable.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.bit.length - 1) {
                        blockNum = that.bit.length - 1;
                    }
                    var res = Math.pow(2, that.bit[blockNum]);
                    self.params.wavetable[i] = Math.round(v * res) / res;
                });
            }
        };
    },

    SampleHold: function (self) {
        this.samps = new Float32Array([1]);
        var that = this;

        this.run = function (time, dur) {
            var ctx = Music.prototype.actx;
            this.in = ctx.createGain();
            this.out = ctx.createGain();
            this.in.connect(this.out);

            var interval = dur * self.params.sr / this.samps.length;
            this.samps.forEach(function (v, i) {
                v = Math.round(v);
                if (v < 1) {
                    v = 1;
                }
                that.samps[i] = v;
            });

            if (Music.prototype.offline) {
                self.params.rendered.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.samps.length - 1) {
                        blockNum = that.samps.length - 1;
                    }
                    var samps = that.samps[blockNum];
                    var hold = 0;
                    if (i % samps === 0) {
                        hold = v;
                    }
                    self.params.rendered[i] = hold;
                });
            } else {
                self.params.wavetable.forEach(function (v, i) {
                    var blockNum = Math.floor(i / interval);
                    if (blockNum > that.samps.length - 1) {
                        blockNum = that.samps.length - 1;
                    }
                    var samps = that.samps[blockNum];
                    var hold = 0;
                    if (i % samps === 0) {
                        hold = v;
                    }
                    self.params.wavetable[i] = hold;
                });
            }
        }
    }
};

function Music() {
    function music() {
        return music.clone();
    }

    music.params = {
        mode: 'wavetable',
        sr: 44100,
        dur: {
            base: null,
            auto: true
        },
        interval: {
            base: null,
            auto: true
        },
        bpm: null,
        time: null,
        offset: null,
        repeat: {max: 0, current: 0, resetNext: true},
        iteration: 0,
        sequence: null,

        onNoteCallback: [],
        offNoteCallback: [],

        interp: 'step',

        baseTime: 0.0, // for offline rendering
        voiceId: Math.random(),
        startTime: 0.0,
        phase: 0.0,
        phasor: {base: null},
        playing: false,

        data: null,
        wavetable: null,
        rendered: null,
        tabLen: 1024,
        lengthFixed: false,
        source: 'sine',
        type: 'synth',
        promise: null,
        pending: false,

        amp: {base: null},

        note: {
            base: null,
            isFinal: true
        },
        freq: {
            base: null,
            isFinal: false
        },
        pitch: {
            base: null,
            isFinal: false
        },

        pan: {base: null},
        curve: false,
        offline: false,

        rtFxOnly: true,
        named: [],

        monitor: {
            state: false,
            grab: null,
            block: 1024
        }
    };

    music.nodes = {
        src: null,
        amp: null,
        pan: null,
        out: null,
        fx: [{}],
        pFx: [{}],
        rtSrc: null,
        phasor: null,
        itvSrc: null,
        monitor: null
    };

    music.meta = {
        type: 'dtm.music',
        setParams: function (newParams) {
            music.params = newParams;
            return music;
        },
        setNodes: function (newNodes) {
            music.nodes = newNodes;
            return music;
        },
        deferIncr: 1
    };

    music.__proto__ = Music.prototype;
    return music;
}

Music.prototype = Object.create(Function.prototype);

Music.prototype.actx = dtm.wa.actx;
Music.prototype.octx = null;
Music.prototype.offline = false;
Music.prototype.dummyBuffer = Music.prototype.actx.createBuffer(1, 1, 44100);
Music.prototype.defaultSize = 512;
Music.prototype.defaultWt = dtm.sine(Music.prototype.defaultSize);
Music.prototype.verbIr = dtm.gen('noise').size(88200).mult(dtm.gen('decay').size(44100));

Music.prototype.defaults = {
    intDur: dtm.data([[1]]),
    bpm: dtm.data([[60]]),
    time: dtm.data([[1/4]]),
    offset: dtm.data([[0]]),
    amp: dtm.data([[0.5]]),
    note: dtm.data([[69]]),
    freq: dtm.data([[440]]),
    pitch: dtm.data([[1]]),
    pan: dtm.data([[0]])
};

Music.prototype.init = function () {
    var that = this;
    var actx = Music.prototype.actx;

    that.params.sr = actx.sampleRate;
    that.params.tabLen = Music.prototype.defaultSize;

    if (isFunction(arguments[0])) {
        that.params.onNoteCallback.push(arguments[0]);
    } else if (isInteger(arguments[0]) && arguments[0] > 0) {
        that.params.tabLen = arguments[0];
    }

    that.params.baseTime = actx.currentTime;

    // TODO: move that to global (master?)
    if (that.params.tabLen !== Music.prototype.defaultSize) {
        // that.params.wavetable = new Float32Array(that.params.tabLen);
        // that.params.wavetable.forEach(function (v, i) {
        //     that.params.wavetable[i] = Math.sin(2 * Math.PI * i / that.params.tabLen);
        // });
        that.params.wavetable = dtm.sine(that.params.tabLen).get();
    } else {
        that.params.wavetable = Music.prototype.defaultWt.get();
    }

    that.params.dur.base = Music.prototype.defaults.intDur;
    that.params.interval.base = Music.prototype.defaults.intDur;
    that.params.bpm = Music.prototype.defaults.bpm;
    that.params.time = Music.prototype.defaults.time;
    that.params.offset = Music.prototype.defaults.offset;
    that.params.amp.base = Music.prototype.defaults.amp;
    that.params.note.base = Music.prototype.defaults.note;
    that.params.freq.base = Music.prototype.defaults.freq;
    that.params.pitch.base = Music.prototype.defaults.pitch;
    that.params.pan.base = Music.prototype.defaults.pan;

    return that;
};

Music.prototype.size = Music.prototype.len = function (val) {
    var that = this;

    if (isInteger(val) && val > 0) {
        that.params.tabLen = val;
        // that.params.wavetable = new Float32Array(that.params.tabLen);
        // that.params.wavetable.forEach(function (v, i) {
        //     that.params.wavetable[i] = Math.sin(2 * Math.PI * i / that.params.tabLen);
        // });
    }
    return that;
};

Music.prototype.mode = function (mode) {
    return this;
};

Music.prototype.clone = function () {
    var m = dtm.music();
    var newParams = {}, newNodes = {};

    try {
        objForEach(this.params, function (v, k) {
            if (['amp', 'note', 'freq', 'pitch', 'pan'].indexOf(k) > -1) {
                newParams[k] = {};

                if (v.base.params.id !== Music.prototype.defaults[k].params.id) {
                    newParams[k].base = v.base.clone(k);
                } else {
                    newParams[k].base = Music.prototype.defaults[k];
                }
                newParams[k].isFinal = v.isFinal;
            } else {
                newParams[k] = v;
            }
        });

        objForEach(this.nodes, function (v, i) {
            newNodes[i] = v;
        });
    } catch (e) {
        console.log(e);
    }

    newParams.voiceId = Math.random();
    return m.meta.setParams(newParams).meta.setNodes(newNodes);
};

/**
 * Returns parameters
 * @function module:music#get
 * @param param
 * @returns {*}
 */
Music.prototype.get = function (param) {
    switch (param) {
        case 'dur':
        case 'duration':
            return this.params.dur;
        case 'source':
            return this.params.source;
        case 'tabLen':
            return this.params.tabLen;
        case 'wavetable':
            return this.params.wavetable;
        case 'id':
            return this.params.voiceId;
        default:
            return this;
    }
};

function getInterval(index) {
    return this.params.interval.base.get(index).get(0) * (240 * this.params.time.get(index).get(0) / this.params.bpm.get(index).get(0));
}

/**
 * Plays a note
 * @function module:music#play
 * @returns {dtm.music}
 */
Music.prototype.play = Music.prototype.p = function (time) {
    var that = this;
    var actx = Music.prototype.actx;
    // var defer = 0.01;
    var defer = 0;

    // TODO: not right
    if (!isEmpty(time) && !isNumber(time)) {
        that.offset.apply(that, arguments);
    }

    // if playSwitch is a function
    if (that.params.pending) {
        console.log('what is this');
        that.params.pending = false;
        that.params.promise.then(function () {
            that.play();
            return that;
        });
        return that;
    }

    // TODO: use promise-all rather than deferring
    // deferred
    setTimeout(function () {
        if (!that.params.lengthFixed) {
            that.params.lengthFixed = true;
        }

        var seqValue = that.params.sequence ? that.params.sequence[mod(that.params.iteration, that.params.sequence.length)] : that.params.iteration;

        // TODO: allow fractional index?
        // TODO: this is in many ways not right
        if (isEmpty(time) || !isNumber(time)) {
            that.params.offset(seqValue).each(function (v, i, d) {
                var voiceIter = that.params.sequence ? that.params.sequence[mod(that.params.iteration + i, that.params.sequence.length)] : that.params.iteration + i;

                if (i === 0) {
                    time = d.get(voiceIter);
                } else {
                    that.clone().iter(voiceIter).play(d.get(voiceIter));
                }
            });
        }

        var amp = that.params.amp.base.get(seqValue).val;
        var pan = that.params.pan.base.get(seqValue).val;
        var pitch;

        if (that.params.note.isFinal) {
            pitch = that.params.note.base.get(seqValue).val.map(function (v) {
                return that.freqToPitch(mtof(v));
            });
        } else if (that.params.freq.isFinal) {
            pitch = that.params.freq.base.get(seqValue).val.map(function (v) {
                return that.freqToPitch(v);
            });
        } else {
            pitch = that.params.pitch.base.get(seqValue).val;
        }

        var interval, dur;
        interval = getInterval.call(that, seqValue);

        if (interval <= 0) {
            interval = 0;
        }

        if (that.params.dur.auto && interval !== 0) {
            if (that.params.dur.auto === 'sample') {
                that.params.tabLen = that.params.wavetable.length;

                dur = 0;
                pitch.forEach(function (v) {
                    dur += that.params.tabLen / that.params.sr / v / pitch.length;
                });
            } else {
                dur = interval;
            }
        } else {
            dur = that.params.dur.base.get(seqValue).val[0];
        }

        if (dur <= 0) {
            dur = 0.001;
        }

        // could be in initialize-note sequence
        if (that.params.repeat.resetNext) {
            that.params.repeat.current = that.params.repeat.max;
            that.params.repeat.resetNext = false;
        }

        var curves;
        dtm.master.addVoice(that);

        //===============================
        if (Music.prototype.offline) {
            // TODO: use promise
            that.params.onNoteCallback.forEach(function (fn) {
                fn(that, seqValue);
            });

            var octx = new OfflineAudioContext(1, (time + dur * 4) * that.params.sr, that.params.sr);

            time += octx.currentTime;

            that.nodes.src = octx.createBufferSource();
            that.nodes.amp = octx.createGain();
            that.nodes.out = octx.createGain();
            that.nodes.fx[0].out = octx.createGain();
            that.nodes.src.connect(that.nodes.amp);
            that.nodes.amp.connect(that.nodes.fx[0].out);
            that.nodes.out.connect(octx.destination);

            for (var n = 1; n < that.nodes.fx.length; n++) {
                that.nodes.fx[n].run(time, dur);
                that.nodes.fx[n - 1].out.connect(that.nodes.fx[n].in);
            }
            that.nodes.fx[n - 1].out.connect(that.nodes.out);

            if (that.params.source === 'noise') {
                that.nodes.src.buffer = octx.createBuffer(1, that.params.sr / 2, that.params.sr);
                var chData = that.nodes.src.buffer.getChannelData(0);
                chData.forEach(function (v, i) {
                    chData[i] = Math.random() * 2.0 - 1.0;
                });
                that.nodes.src.loop = true;
            } else {
                that.nodes.src.buffer = octx.createBuffer(1, that.params.tabLen, that.params.sr);
                that.nodes.src.buffer.copyToChannel(that.params.wavetable, 0);
                that.nodes.src.loop = true;
            }

            curves = [];
            curves.push({param: that.nodes.src.playbackRate, value: pitch});
            curves.push({param: that.nodes.amp.gain, value: amp});
            that.setParamCurve(time, dur, curves);

            that.nodes.fx[0].out.gain.value = 1.0;
            that.nodes.out.gain.value = 0.3;

            that.nodes.src.start(time);
            that.nodes.src.stop(time + dur);

            octx.startRendering();
            octx.oncomplete = function (e) {
                that.params.rendered = e.renderedBuffer.getChannelData(0);

                time += that.params.baseTime;

                that.nodes.rtSrc = actx.createBufferSource();
                that.nodes.pFx[0].out = actx.createGain();
                that.nodes.pan = actx.createStereoPanner();
                var out = actx.createGain();
                that.nodes.rtSrc.connect(that.nodes.pFx[0].out);
                for (var n = 1; n < that.nodes.pFx.length; n++) {
                    that.nodes.pFx[n].run(time, dur);
                    that.nodes.pFx[n - 1].out.connect(that.nodes.pFx[n].in);
                }
                that.nodes.pFx[n - 1].out.connect(that.nodes.pan);
                that.nodes.pan.connect(out);
                out.connect(actx.destination);

                var stupidBuffer = actx.createBuffer(1, that.params.rendered.length, that.params.sr);
                stupidBuffer.copyToChannel(that.params.rendered, 0);
                that.nodes.rtSrc.buffer = stupidBuffer;
                that.nodes.rtSrc.loop = false;
                that.nodes.rtSrc.start(time);
                that.nodes.rtSrc.stop(time + that.nodes.rtSrc.buffer.length);

                that.setParamCurve(time, dur, [{param: that.nodes.pan.pan, value: pan}]);

                out.gain.value = 1.0;

                that.nodes.rtSrc.onended = function () {
                    stupidBuffer = undefined;
                    try {
                        that.nodes.rtSrc.buffer = Music.prototype.dummyBuffer;
                    } catch (e) {
                    }
                    that.nodes.rtSrc.disconnect(0);
                    that.nodes.rtSrc.onended = undefined;
                    that.nodes.rtSrc = undefined;

                    dtm.master.removeVoice(that);

                    if (that.params.repeat.current > 1) {
                        that.play(); // TODO: pass any argument?
                        that.params.repeat.current--;
                    } else {
                        that.params.repeat.resetNext = true;
                    }
                };
            };
        } else {
            var silence = actx.createGain();
            silence.gain.value = 1;

            // for calling back functions after delay
            if (time !== 0) {
                that.nodes.preSrc = actx.createBufferSource();
                that.nodes.preSrc.buffer = Music.prototype.dummyBuffer;
                that.nodes.preSrc.loop = true;
                that.nodes.preSrc.connect(silence);

                that.nodes.preSrc.onended = function () {
                    that.params.onNoteCallback.forEach(function (fn) {
                        fn(that, seqValue);
                    });
                };

                that.nodes.preSrc.start(actx.currentTime);
                that.nodes.preSrc.stop(actx.currentTime + time);
            } else {
                // TODO: use promise
                that.params.onNoteCallback.forEach(function (fn) {
                    fn(that, seqValue);
                });
            }

            time += actx.currentTime;

            that.params.startTime = time;

            that.nodes.src = actx.createBufferSource();
            that.nodes.amp = actx.createGain();
            that.nodes.pFx[0].out = actx.createGain();

            if (actx.createStereoPanner) {
                that.nodes.pan = actx.createStereoPanner();
            } else {
                that.nodes.left = actx.createGain();
                that.nodes.right = actx.createGain();
                that.nodes.merger = actx.createChannelMerger(2);
            }

            var declipper = actx.createGain();
            var out = actx.createGain();
            that.nodes.src.connect(that.nodes.amp);
            that.nodes.amp.connect(declipper);
            declipper.connect(that.nodes.pFx[0].out);
            for (var n = 1; n < that.nodes.pFx.length; n++) {
                that.nodes.pFx[n].run(time, dur);
                that.nodes.pFx[n - 1].out.connect(that.nodes.pFx[n].in);
            }

            if (actx.createStereoPanner) {
                that.nodes.pFx[n - 1].out.connect(that.nodes.pan);
                that.nodes.pan.connect(out);
            } else {
                that.nodes.pFx[n - 1].out.connect(that.nodes.left);
                that.nodes.pFx[n - 1].out.connect(that.nodes.right);
                that.nodes.left.connect(that.nodes.merger, 0, 0);
                that.nodes.right.connect(that.nodes.merger, 0, 1);
                that.nodes.merger.connect(out);
            }

            that.nodes.itvSrc = actx.createBufferSource();
            that.nodes.itvSrc.buffer = Music.prototype.dummyBuffer;
            that.nodes.itvSrc.loop = true;
            that.nodes.itvSrc.connect(silence);
            silence.connect(out);

            var tempBuff = actx.createBuffer(1, that.params.tabLen, that.params.sr); // FF needs this stupid procedure of storing to a variable (Feb 18, 2016)
            if (tempBuff.copyToChannel) {
                // for Safari
                tempBuff.copyToChannel(that.params.wavetable, 0);
            } else {
                var tempTempBuff = tempBuff.getChannelData(0);
                tempTempBuff.forEach(function (v, i) {
                    tempTempBuff[i] = that.params.wavetable[i];
                });
            }
            that.nodes.src.buffer = tempBuff;
            that.nodes.src.loop = (that.params.type !== 'sample');

            if (!that.params.monitor.process) {
                out.connect(actx.destination);
            }

            //========= monitoring ==========
            if (that.params.monitor.state) {
                that.nodes.monitor = actx.createScriptProcessor(that.params.monitor.block, 1, 1);
                var monitorData = dtm.data();

                if (that.params.mode === 'phasor') {
                    that.nodes.monitor.onaudioprocess = function () {
                        var phase = that.phase();
                        if (that.params.phasor.base) {
                            phase = that.params.phasor.base(seqValue).get(phase * that.params.phasor.base.get(seqValue).length);
                        }
                        if (isFunction(that.params.monitor.grab)) {
                            that.params.monitor.grab(monitorData.set(phase), seqValue);
                        } else {
                            that.params.monitor.grab.set(phase);
                        }
                    };
                } else {
                    // TODO: not cleared?
                    that.nodes.monitor.onaudioprocess = function (event) {
                        var samps = event.inputBuffer.getChannelData(0);
                        if (isFunction(that.params.monitor.grab)) {
                            var processed = that.params.monitor.grab(monitorData.set(samps));

                            if (that.params.monitor.process) {
                                var outputBuffer = event.outputBuffer.getChannelData(0);
                                if (processed !== outputBuffer.length) {
                                    processed.fit(outputBuffer.length);
                                }
                                for (var i = 0, l = outputBuffer.length; i < l; i++) {
                                    outputBuffer[i] = processed.get(i);
                                }
                            }
                        } else {
                            that.params.monitor.grab.set(samps);
                        }
                    };
                }

                var mntGain = actx.createGain();
                mntGain.gain.value = that.params.monitor.process ? 1 : 0;

                out.connect(that.nodes.monitor).connect(mntGain).connect(actx.destination);
            }
            //===============================

            // onended was sometimes not getting registered before src.start for some reason
            var p = new Promise(function (resolve) {
                that.nodes.itvSrc.onended = function () {
                    if (interval >= dur) {
                        dtm.master.removeVoice(that);
                    }

                    // rep(1) would only play once
                    if (that.params.repeat.current > 1) {
                        that.play(); // TODO: pass any argument?
                        that.params.repeat.current--;
                    } else {
                        that.params.repeat.resetNext = true;

                        if (that.params.monitor.state) {
                            // that.params.monitor.state = false;
                        }
                    }

                    that.params.offNoteCallback.forEach(function (fn) {
                        fn(that, seqValue);
                    });
                };

                that.nodes.src.onended = function () {
                    if (dur > interval) {
                        dtm.master.removeVoice(that);
                    }

                    if (that.params.monitor.state) {
                        // that.params.monitor.state = false;
                        that.nodes.monitor.onaudioprocess = null;
                        that.nodes.monitor.disconnect();
                        that.nodes.monitor = null;
                    }

                    that.params.playing = false;
                };

                resolve();
            });

            p.then(function () {
                that.nodes.itvSrc.start(time);
                that.nodes.itvSrc.stop(time + interval);
                that.nodes.src.start(time + 0.00001);
                that.nodes.src.stop(time + dur + 0.00001);

                // ignoring start offset for now
                // need a timer
                that.params.playing = true;
            });

            curves = [];
            curves.push({param: that.nodes.src.playbackRate, value: pitch});
            curves.push({param: that.nodes.amp.gain, value: amp});
            that.setParamCurve(time, dur, curves);

            if (actx.createStereoPanner) {
                that.setParamCurve(time, dur, [{param: that.nodes.pan.pan, value: pan}]);
            } else {
                var left = pan.map(function (v) {
                    if (v < 0) {
                        return 0.5;
                    } else {
                        return 0.5 - v * 0.5;
                    }
                });

                var right = pan.map(function (v) {
                    if (v < 0) {
                        return 0.5 + v * 0.5;
                    } else {
                        return 0.5;
                    }
                });
                that.setParamCurve(time, dur, [{param: that.nodes.left.gain, value: left}]);
                that.setParamCurve(time, dur, [{param: that.nodes.right.gain, value: right}]);
            }

            that.nodes.pFx[0].out.gain.value = 1.0; // ?
            out.gain.value = 1.0;

            var ramp = 0.002;
            declipper.gain.setValueAtTime(0.0, time);
            declipper.gain.linearRampToValueAtTime(1.0, time + ramp);
            declipper.gain.setTargetAtTime(0.0, time + dur - ramp, ramp * 0.3);
        }

        that.params.iteration++;

        // }, defer + that.meta.deferIncr);
    }, defer);

    return that;
};

Music.prototype.start = function () {
    this.interval.apply(this, arguments);
    this.rep().play();
    return this;
};

/**
 * Triggers itself (including the registered callback functions) after a certain time delay.
 * @type {Music.t}
 */
Music.prototype.trigger = Music.prototype.trig = Music.prototype.t = function () {
    this.offset.apply(this, arguments);
    this.mute().play();
    return this;
};

Music.prototype.run = Music.prototype.r = function () {
    this.interval.apply(this, arguments);
    this.mute().rep().play();
    return this;
};

/**
 * Stops the currently playing sound.
 * @function module:music#stop
 * @param [time=0] {number} Delay in seconds for the stop action to be called.
 * @returns {dtm.music}
 */
Music.prototype.stop = Music.prototype.s = function (time) {
    var that = this;

    var defer = 0.0;

    if (!isNumber(time)) {
        time = 0.0; // TODO: time not same as rt rendering time
    }

    that.params.repeat.current = 0;
    that.params.repeat.resetNext = true;

    setTimeout(function () {
        if (that.nodes.src) {
            that.nodes.src.stop(time);
        }

        if (that.nodes.itvSrc) {
            that.nodes.itvSrc.stop(time);
        }

        if (that.nodes.rtSrc) {
            that.nodes.rtSrc.stop(time);
        }

        that.params.monitor.state = false;
        if (that.nodes.monitor) {
            that.nodes.monitor.onaudioprocess = null;
            that.nodes.monitor.disconnect();
        }

        dtm.master.removeVoice(that);
    // }, defer + that.meta.deferIncr * 2);
    }, that.meta.deferIncr);

    return that;
};

Music.prototype.aft = Music.prototype.after = Music.prototype.offset = function () {
    var argList = argsToArray(arguments);
    if (check(argList)) {
        this.params.offset = convert(argList);
    }
    return this;
};

Music.prototype.mute = function (bool) {
    if (isBoolean(bool)) {
        var val = bool ? 0 : 1;
        this.gain(val);
    } else {
        this.gain(0);
    }
    return this;
};

Music.prototype.unmute = function () {
    this.gain(1);
    return this;
};

Music.prototype.sync = Music.prototype.follow = function (input) {
    if (isDtmSynth(input)) {
        this.interval(input);
        this.bpm(input);
        this.time(input);
        this.seq(input);
    }
    return this;
};

Music.prototype.mimic = function (input) {
    if (isDtmSynth(input)) {
        this.interval(input);
        this.bpm(input);
        this.time(input);
        this.seq(input);
        this.note(input);
        this.amplitude(input);
        this.pan(input);
        this.wavetable(input);
    }
    return this;
};

Music.prototype.each = Music.prototype.do = Music.prototype.on = Music.prototype.onnote = function (fn) {
    if (isFunction(fn)) {
        this.params.onNoteCallback.push(fn);
    }
    return this;
};

Music.prototype.off = Music.prototype.offnote = function (fn) {
    if (isFunction(fn)) {
        this.params.offNoteCallback.push(fn);
    }
    return this;
};

// set order of the iteration
Music.prototype.sequence = Music.prototype.seq = function (input) {
    if (input === 'reset' || input === 'clear' || input === []) {
        this.params.sequence = null;
    }

    if (isDtmSynth(input)) {
        this.params.sequence = [input.seq()];
    } else if (argsAreSingleVals(arguments) && arguments.length > 1) {
        if (isNumOrFloat32Array(argsToArray(arguments))) {
            this.params.sequence = argsToArray(arguments);
        }
    } else if (isNumber(input)) {
        this.params.sequence = [input];
    } else if (isNumOrFloat32Array(input)) {
        this.params.sequence = input;
    } else if (isNumDtmArray(input)) {
        this.params.sequence = input.get();
    } else {
        return this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;
    }

    return this;
};

// bad name, should be "reset"?
Music.prototype.iter = Music.prototype.incr = function (val) {
    if (isInteger(val)) {
        this.params.iteration = val;
        return this;
    }
    return this.params.iteration;
};

Music.prototype.scan = Music.prototype.phase = function (input, block) {
    if (isDtmArray(input) || isFunction(input)) {
        this.params.mode = 'phasor';

        if (!isNumber(block)) {
            block = 1024;
        }

        this.params.monitor.state = true;
        this.params.monitor.grab = input;
        this.params.monitor.block = block;
        return this;
    } else {
        // TODO: dur or interval?
        this.params.phase = (Music.prototype.actx.currentTime - this.params.startTime) / this.params.interval.base(this.seq()).get(0);
        if (this.params.phase < 0.0) {
            this.params.phase = 0.0;
        } else if (this.params.phase > 1.0) {
            this.params.phase = 1.0;
        }
        return this.params.phase;
    }
};

Music.prototype.repeat = Music.prototype.rep = function (times) {
    if (isInteger(times) && times > 0) {
        this.params.repeat.max = times;
    } else if (isEmpty(times) || times === Infinity || times === true) {
        this.params.repeat.max = Infinity;
    }

    this.params.repeat.resetNext = true;
    return this;
};

/**
 * Sets the interval in seconds between repeated or iterated events.
 * @type {Music.i}
 */
Music.prototype.every = Music.prototype.at = Music.prototype.interval = Music.prototype.int = Music.prototype.i = function () {
    var depth = 2;

    if (arguments.length === 0) {
        return this.params.interval.base();
    }

    var res;
    if (isDtmSynth(arguments[0])) {
        res = arguments[0].interval();
        this.params.interval.base = check(res, depth) ? convertShallow(res) : this.params.interval.base;
    } else if (isFunction(arguments[0])) {
        res = arguments[0](this.params.interval.base, this);
        this.params.interval.base = check(res, depth) ? convertShallow(res) : this.params.interval.base;
    } else {
        var argList = argsToArray(arguments);
        this.params.interval.base = check(argList) ? convertShallow(argList) : this.params.interval.base;
    }

    this.params.interval.auto = false;

    if (this.params.dur.auto) {
        this.params.dur.auto = 'interval';
    }

    return this;
};

// Music.prototype.rate

Music.prototype.bpm = function () {
    if (arguments.length === 0) {
        return this.params.bpm()
    }
    var depth = 2;

    var res;
    if (isDtmSynth(arguments[0])) {
        res = arguments[0].bpm();
        this.params.bpm = check(res, depth) ? convertShallow(res) : this.params.bpm;
    } else if (isFunction(arguments[0])) {
        res = arguments[0](this.params.bpm, this);
        this.params.bpm = check(res, depth) ? convertShallow(res) : this.params.bpm;
    } else {
        var argList = argsToArray(arguments);
        this.params.bpm = check(argList) ? convertShallow(argList) : this.params.bpm;
    }

    this.params.interval.auto = false;

    if (this.params.dur.auto) {
        this.params.dur.auto = 'interval';
    }

    return this;
};

Music.prototype.time = function () {
    if (arguments.length === 0) {
        return this.params.time()
    }
    var depth = 2;

    var res;
    if (isDtmSynth(arguments[0])) {
        res = arguments[0].time();
        this.params.time = check(res, depth) ? convertShallow(res) : this.params.time;
    } else if (isFunction(arguments[0])) {
        res = arguments[0](this.params.time, this);
        this.params.time = check(res, depth) ? convertShallow(res) : this.params.time;
    } else {
        var argList = argsToArray(arguments);
        this.params.time = check(argList) ? convertShallow(argList) : this.params.time;
    }

    return this;
};

/**
 * Takes array types with only up to the max depth of 1.
 * @function module:music#dur
 * @returns {dtm.music}
 */
Music.prototype.for = Music.prototype.duration = Music.prototype.dur = Music.prototype.d = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        if (this.params.dur.auto) {
            return this.params.interval.base(seqValue);
        } else {
            return this.params.dur.base(seqValue);
        }
    }

    var depth = 2;
    var res;
    if (isDtmSynth(arguments[0])) {
        res = arguments[0].duration();
        this.params.dur.base = check(res, depth) ? convertShallow(res) : this.params.dur.base;
    } else if (isFunction(arguments[0])) {
        res = arguments[0](this.params.dur.base, this);
        this.params.dur.base = check(res, depth) ? convertShallow(res) : this.params.dur.base;
    } else {
        var argList = argsToArray(arguments);
        this.params.dur.base = check(argList) ? convertShallow(argList) : this.params.dur.base;
    }

    this.params.dur.auto = false;

    return this;
};

/**
 * @function module:music#amp
 * @returns {dtm.music}
 */
Music.prototype.amplitude = Music.prototype.amp = Music.prototype.a = function () {
    var that = this;
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.amp.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        // TODO: will be muted when the parent is triggering / running
        // should fix and use gain instead
        return this.amplitude(arguments[0].amp());
    }

    this.mapParam(arguments, this.params.amp);

    // TODO: experimental
    if (that.params.playing) {
        that.nodes.amp.gain.cancelScheduledValues(that.params.startTime);
        var amp = that.params.amp.base.get(seqValue).val;

        //==================== copied from play()
        var interval, dur;
        interval = getInterval.call(that, seqValue);

        if (interval <= 0) {
            interval = 0;
        }

        if (that.params.dur.auto && interval !== 0) {
            if (that.params.dur.auto === 'sample') {
                dur = interval; // TODO: pitch-curve dependent
            } else {
                dur = interval;
            }
        } else {
            dur = that.params.dur.base.get(seqValue).val[0];
        }

        if (dur <= 0) {
            dur = 0.001;
        }
        //====================

        that.setParamCurve(that.params.startTime, dur, [{param: that.nodes.amp.gain, value: amp}]);
    }
    return this;
};

/**
 * Sets the frequency of the oscillator
 * @function module:music#freq
 * @returns {dtm.music}
 */
Music.prototype.frequency = Music.prototype.freq = Music.prototype.f = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.freq.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.frequency(arguments[0].freq());
    }
    this.mapParam(arguments, this.params.freq);
    this.setFinal('freq');

    return this;
};

/**
 * Sets the pitch of the oscillator by a MIDI note number.
 * @function module:music#note
 * @returns {dtm.music}
 */
Music.prototype.notenum = Music.prototype.note = Music.prototype.nn = Music.prototype.n = function () {
    var that = this;
    var seqValue = that.params.sequence ? that.params.sequence[mod(that.params.iteration, that.params.sequence.length)] : that.params.iteration;

    if (arguments.length === 0) {
        return that.params.note.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return that.note(arguments[0].note());
    }
    if (arguments.length === 1 && isDtmArray(arguments[0]) && arguments[0].params.isTarget) {
        arguments[0].attach(that, that.note);
    }
    that.mapParam(arguments, that.params.note);
    that.setFinal('note');

    // TODO: experimental
    if (that.params.playing) {
        that.nodes.src.playbackRate.cancelScheduledValues(that.params.startTime);
        var pitch = that.params.note.base.get(seqValue).val.map(function (v) {
            return that.freqToPitch(mtof(v));
        });

        //==================== copied from play()
        var interval, dur;
        interval = getInterval.call(that, seqValue);

        if (interval <= 0) {
            interval = 0;
        }

        if (that.params.dur.auto && interval !== 0) {
            if (that.params.dur.auto === 'sample') {
                that.params.tabLen = that.params.wavetable.length;

                dur = 0;
                pitch.forEach(function (v) {
                    dur += that.params.tabLen / that.params.sr / v / pitch.length;
                });
            } else {
                dur = interval;
            }
        } else {
            dur = that.params.dur.base.get(seqValue).val[0];
        }

        if (dur <= 0) {
            dur = 0.001;
        }
        //====================

        that.setParamCurve(that.params.startTime, dur, [{param: that.nodes.src.playbackRate, value: pitch}]);
    }

    return that;
};

// for longer sample playback
Music.prototype.pitch = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.pitch.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.pitch(arguments[0].pitch());
    }

    this.mapParam(arguments, this.params.pitch);
    this.setFinal('pitch');
    return this;
};

Music.prototype.pan = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.pan.base(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.pan(arguments[0].pan());
    }

    this.mapParam(arguments, this.params.pan);
    return this;
};

// TODO: wavetable param should be a dtm.data object
// TODO: too many aliases
Music.prototype.osc = Music.prototype.w = Music.prototype.wave = Music.prototype.wf = Music.prototype.waveform = Music.prototype.wt = Music.prototype.wavetable = function (src) {
    var that = this;

    if (arguments.length === 0) {
        return dtm.data(that.params.wavetable);
    } else if (isDtmSynth(arguments[0])) {
        return that.wavetable(arguments[0].wavetable());
    }

    src = typeCheck(src);
    if (isFloat32Array(src)) {
        // for the morphing / in-note modulation
        if (that.params.lengthFixed) {
            if (that.params.tabLen !== src.length) {
                that.params.wavetable = dtm.data(src).step(that.params.tabLen).get();
            } else {
                that.params.wavetable = src;
            }
        } else {
            that.params.wavetable = src;
            that.params.tabLen = src.length;
            // that.params.pitch = freqToPitch(that.params.freq); // ?
        }
    } else if (isFunction(src)) {
        if (that.params.promise) {
            that.params.promise.then(function () {
                that.params.wavetable = toFloat32Array(src(dtm.data(that.params.wavetable)));
            });
        } else {
            that.params.wavetable = toFloat32Array(src(dtm.data(that.params.wavetable)));
            that.params.tabLen = that.params.wavetable.length;
            //that.params.pitch = freqToPitch(that.params.freq); // ?
        }
    } else {
        that.params.wavetable = new Float32Array(that.params.tabLen);
        that.params.wavetable.forEach(function (v, i) {
            that.params.wavetable[i] = Math.sin(2 * Math.PI * i / that.params.tabLen);
        });
    }

    if (arguments.length === 1 && isDtmArray(arguments[0]) && arguments[0].params.isTarget) {
        arguments[0].attach(that, that.wavetable);
    }

    if (that.params.playing) {
        if (that.params.wavetable.length !== that.params.tabLen) {
            that.params.wavetable = dtm.data(that.params.wavetable).step(that.params.tabLen).get();
        }
        if (that.nodes.src.buffer.copyToChannel) {
            // for Safari
            that.nodes.src.buffer.copyToChannel(that.params.wavetable, 0);
        } else {
            var tempBuff = that.nodes.src.buffer.getChannelData(0);
            tempBuff.forEach(function (v, i) {
                tempBuff[i] = that.params.wavetable[i];
            });
        }
    }

    return that;
};


Music.prototype.load = function (name) {
    var that = this;

    if (name === 'noise') {
        that.params.wavetable = dtm.gen('noise').size(44100).get();
        that.freq(1);

    } else if (isString(name)) {
        that.params.pending = true;
        that.params.source = name;
        that.params.type = 'sample';
        that.pitch(1);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', name, true);
        xhr.responseType = 'arraybuffer';
        that.params.promise = new Promise(function (resolve) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    Music.prototype.actx.decodeAudioData(xhr.response, function (buf) {
                        that.params.wavetable = buf.getChannelData(0);

                        if (that.params.dur.auto) {
                            that.params.dur.auto = 'sample';
                        }
                        resolve(that);
                    });
                }
            };
        });

        xhr.send();
    }
    //else if (arg.constructor.name === 'ArrayBuffer') {
    //    actx.decodeAudioData(arg, function (buf) {
    //        params.buffer = buf;
    //        resolve(synth);
    //
    //        if (typeof(cb) !== 'undefined') {
    //            cb(synth);
    //        }
    //    });
    //} else if (arg.constructor === Array) {
    //    var buf = actx.createBuffer(1, arg.length, dtm.wa.actx.sampleRate);
    //    var content = buf.getChannelData(0);
    //    content.forEach(function (val, idx) {
    //        content[idx] = arg[idx];
    //    });
    //
    //    params.buffer = buf;
    //    resolve(synth);
    //
    //    if (typeof(cb) !== 'undefined') {
    //        cb(synth);
    //    }
    //}
    return that;
};

function typeCheck(src) {
    if (isNestedDtmArray(src)) {
        //return toFloat32Array(src);
        return src;
    } else if (isFunction(src)) {
        //return deferCallback(src);
        return src;
    } else {
        return toFloat32Array(src);
    }
}

function check(src, depth) {
    if (!isInteger(depth)) {
        depth = 3;
    }
    return isNumber(src) ||
        ((isNumDtmArray(src) ||
        // isNumArray(src) ||
        isNumOrFloat32Array(src) ||
        isNestedArray(src) ||
        isNestedWithDtmArray(src) ||
        isNestedNumDtmArray(src)) && getMaxDepth(src) <= depth);
}

function convert(src) {
    if (isArray(src) && src.length === 1) {
        return convert(src[0]);
    } else {
        if (isNestedNumDtmArray(src)) {
            return src;
        } else if (isNestedWithDtmArray(src)) {
            return dtm.data(src);
        } else if (isNumDtmArray(src)) {
            return dtm.data([src]);
        } else if (isNestedArray(src)) {
            return dtm.data(src);
        } else if (isNumOrFloat32Array(src)) {
            return dtm.data([src]);
        } else {
            return dtm.data([toFloat32Array(src)]);
        }
    }
}

function convertShallow(src) {
    if (isArray(src) && src.length === 1) {
        return convertShallow(src[0]);
    } else {
        if (isNestedNumDtmArray(src)) {
            return src;
        } else if (isNestedWithDtmArray(src)) {
            return dtm.data.apply(this, src);
        } else if (isNumDtmArray(src)) {
            return src().block(1);
        } else if (isNestedArray(src)) {
            return dtm.data(src);
        } else if (isNumOrFloat32Array(src)) {
            return dtm.data(src).block(1);
        } else {
            return dtm.data([toFloat32Array(src)]);
        }
    }
}

// TODO: 'base' vs 'mod' not needed anymore?
Music.prototype.mapParam = function (args, param, mod) {
    var res, argList;

    if (mod === 'base' || typeof(mod) === 'undefined') {
        if (isFunction(args[0])) {
            res = args[0](param['base'], this);
            param['base'] = check(res) ? convert(res) : param;
        } else {
            argList = argsToArray(args);
            param['base'] = check(argList) ? convert(argList) : param;
        }
    }
};

Music.prototype.freqToPitch = function (freq) {
    var that = this;
    if (isFloat32Array(freq)) {
        var res = new Float32Array(freq.length);
        freq.forEach(function (v, i) {
            res[i] = v * that.params.tabLen / that.params.sr;
        });
        return res;
    } else if (isNumber(freq)) {
        return freq * that.params.tabLen / that.params.sr;
    }
};

Music.prototype.setParamCurve = function (time, dur, curves) {
    var that = this;
    curves.forEach(function (curve) {
        var ksmps = 100;
        // if the curve length exceeds the "control rate"
        if (that.params.curve || (that.params.sr * dur / curve.value.length) < ksmps) {
            if (curve.value.length === 1) {
                curve.value.push(curve.value[0]);
            }
            curve.param.setValueCurveAtTime(toFloat32Array(curve.value), time, dur);
        } else {
            curve.value.forEach(function (v, i) {
                curve.param.setValueAtTime(v, time + i / curve.value.length * dur);
                // for chrome v53.0.2785.116
                if (i === curve.value.length - 1) {
                    curve.param.setValueAtTime(v, time + dur);
                }
            });
        }
    });
};

Music.prototype.setFinal = function (param) {
    var that = this;
    ['note', 'freq', 'pitch'].forEach(function (v) {
        that.params[v].isFinal = v === param;
    });
};

/**
 * @function module:music#gain
 * @param mult
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.gain = function (mult, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var gain = new fx.Gain(this, post);

    mult = typeCheck(mult);
    if (mult) {
        gain.mult = mult;
    }

    if (post) {
        this.nodes.pFx.push(gain);
    } else {
        this.nodes.fx.push(gain);
    }
    return this;
};

/**
 * @function module:music#lpf
 * @param freq
 * @param q
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.lpf = function (freq, q, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var lpf = new fx.LPF(this, post);

    freq = typeCheck(freq);
    if (freq) {
        lpf.freq = freq;
    }

    q = typeCheck(q);
    if (q) {
        lpf.q = q;
    }

    if (post) {
        this.nodes.pFx.push(lpf);
    } else {
        this.nodes.fx.push(lpf);
    }
    return this;
};

/**
 * @function module:music#hpf
 * @param freq
 * @param q
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.hpf = function (freq, q, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var hpf = new fx.HPF(this, post);

    freq = typeCheck(freq);
    if (freq) {
        hpf.freq = freq;
    }

    q = typeCheck(q);
    if (q) {
        hpf.q = q;
    }

    if (post) {
        this.nodes.pFx.push(hpf);
    } else {
        this.nodes.fx.push(hpf);
    }
    return this;
};

/**
 * @function module:music#bpf
 * @param freq
 * @param q
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.bpf = function (freq, q, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var bpf = new fx.BPF(this, post);

    freq = typeCheck(freq);
    if (freq) {
        bpf.freq = freq;
    }

    q = typeCheck(q);
    if (q) {
        bpf.q = q;
    }

    if (post) {
        this.nodes.pFx.push(bpf);
    } else {
        this.nodes.fx.push(bpf);
    }
    return this;
};

/**
 * @function module:music#apf
 * @param freq
 * @param q
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.apf = function (freq, q, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var apf = new fx.APF(this, post);

    freq = typeCheck(freq);
    if (freq) {
        apf.freq = freq;
    }

    q = typeCheck(q);
    if (q) {
        apf.q = q;
    }

    if (post) {
        this.nodes.pFx.push(apf);
    } else {
        this.nodes.fx.push(apf);
    }
    return this;
};

/**
 * @function module:music#delay
 * @param mix
 * @param time
 * @param feedback
 * @param post
 * @returns {dtm.music}
 */
Music.prototype.delay = function (mix, time, feedback, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var delay = new fx.Delay(this, post);

    mix = typeCheck(mix);
    if (mix) {
        delay.mix = mix;
    }

    time = typeCheck(time);
    if (time) {
        delay.time = time;
    }

    feedback = typeCheck(feedback);
    if (feedback) {
        delay.feedback = feedback;
    }

    if (post) {
        this.nodes.pFx.push(delay);
    } else {
        this.nodes.fx.push(delay);
    }
    return this;
};

Music.prototype.reverb = Music.prototype.verb = function (mix, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var verb = new fx.Reverb(this, post);

    mix = typeCheck(mix);
    if (mix) {
        verb.mix = mix;
    }

    if (post) {
        this.nodes.pFx.push(verb);
    } else {
        this.nodes.fx.push(verb);
    }
    return this;
};

Music.prototype.convolve = Music.prototype.conv = function (tgt, mix, post) {
    post = isBoolean(post) ? post : this.params.rtFxOnly;
    var conv = new fx.Convolver(this, post);

    tgt = typeCheck(tgt);
    if (tgt) {
        conv.tgt = tgt;
    }

    mix = typeCheck(mix);
    if (mix) {
        conv.mix = mix;
    }

    if (post) {
        this.nodes.pFx.push(conv);
    } else {
        this.nodes.fx.push(conv);
    }
    return this;
};

/**
 * @function module:music#bq
 * @param bit
 * @returns {dtm.music}
 */
Music.prototype.bitquantize = Music.prototype.bq = function (bit) {
    var bq = new fx.BitQuantizer(this);

    bit = typeCheck(bit);
    if (bit) {
        bq.bit = bit;
    }
    this.nodes.pFx.push(bq);
    return this;
};

/**
 * @function module:music#sh | samphold | samplehold
 * @param samps
 * @returns {dtm.music}
 */
Music.prototype.samphold = Music.prototype.sh = function (samps) {
    var sh = new fx.SampleHold(this);

    samps = typeCheck(samps);
    if (samps) {
        sh.samps = samps;
    }
    this.nodes.pFx.push(sh);
    return this;
};

Music.prototype.monitor = function (input, block) {
    if (!isNumber(block)) {
        block = 1024;
    }

    if (isDtmArray(input) || isFunction(input)) {
        this.params.monitor.state = true;
        this.params.monitor.grab = input;
        this.params.monitor.block = block;
    }

    return this;
};

Music.prototype.process = function (input, block) {
    if (!isNumber(block)) {
        block = 1024;
    }

    if (isDtmArray(input) || isFunction(input)) {
        this.params.monitor.state = true;
        this.params.monitor.process = true;
        this.params.monitor.grab = input;
        this.params.monitor.block = block;
    }

    return this;
};

Music.prototype.curve = Music.prototype.phasor = function () {
    var seqValue = this.params.sequence ? this.params.sequence[mod(this.params.iteration, this.params.sequence.length)] : this.params.iteration;

    if (arguments.length === 0) {
        return this.params.phasor(seqValue);
    } else if (isDtmSynth(arguments[0])) {
        return this.phasor(arguments[0].phasor());
    }

    this.mapParam(arguments, this.params.phasor);
    return this;
};

Music.prototype.fft = function (input, block) {
    return this;
};

dtm.startWebAudio();

/* obsolete? */
// synth.mod = function (name, val) {
//     if (isString(name) && params.named.hasOwnProperty(name)) {
//         setTimeout(function () {
//             params.named[name].cancelScheduledValues(0); // TODO: check
//             params.named[name].setValueAtTime(val, 0);
//         }, 0);
//     }
//     return synth;
// };
//
// synth.modulate = synth.mod;
//
// testing
// synth.cancel = function (time) {
//     if (!isNumber(time)) {
//         time = 0.0;
//     }
//
//     objForEach(params.named, function (p) {
//         p.cancelScheduledValues(actx.currentTime + time);
//     });
//
//     return synth;
// };
dtm.midi = function () {
    var midi = new MIDI();
    return midi.init.apply(midi, arguments)
};

function MIDI() {
    function midi() {
        return midi;
    }

    midi.params = {};

    midi.__proto__ = MIDI.prototype;
    return midi;
}

MIDI.prototype = Object.create(Function.prototype);

MIDI.prototype.out = null;
MIDI.prototype.defaults = {
    note: dtm.data([[69]]),
    pitchbend: dtm.data([[0]]),
    velocity: dtm.data([[100]]),
    duration: dtm.data([[1]]),
    channel: dtm.data([[1]])
};

MIDI.prototype.init = function () {
    var that = this;
    if (isEmpty(MIDI.prototype.out)) {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({
                sysex: false
            }).then(function (webMidi) {
                var devices = [];
                var iter = webMidi.outputs.values();
                for (var i = iter.next(); i && !i.done; i = iter.next()) {
                    devices.push(i.value);
                }
                MIDI.prototype.devices = devices;
                MIDI.prototype.out = devices[0];
            }, null);
        } else {
            console.log("No MIDI support in your browser.");
        }
    }

    objForEach(MIDI.prototype.defaults, function (v, k) {
        that.params[k] = v;
    });

    return this;
};

MIDI.prototype.play = function () {
    var that = this;

    if (MIDI.prototype.out) {
        var out = MIDI.prototype.out;

        setTimeout(function () {
            var seqValue = 0;
            var dur = that.params.duration.get(seqValue).get(0);

            if (that.params.pitchbend !== MIDI.prototype.defaults.pitchbend) {
                dtm.music().phasor(function (d, i) {
                    var pbVal = that.params.pitchbend(seqValue).phase(d, 'step').range(0, 16383, -1, 1).round().val[0];
                    var upper = Math.floor(pbVal / 128);
                    var lower = pbVal - upper * 128;
                    out.send([224, lower, upper]);
                }, 256).trigger().for(dur);
            } else {
                out.send([224, 0, 64]);
            }

            var notes = that.params.note.get(seqValue);
            dur /= notes.length;

            var ch = that.params.channel.get(seqValue);
            if (ch.length !== notes.length) {
                ch = ch().step(notes.length);
            }

            dtm.music()
                .onnote(function (m, i) {
                    out.send([143 + ch(i).val[0], notes(i).val[0], 100]);
                })
                .offnote(function (m, i) {
                    out.send([143 + ch(i).val[0], notes(i).val[0], 0]);
                })
                .trigger()
                .every(dur)
                .rep(notes.length);
        });
    }
    return this;
};

MIDI.prototype.stop = function () {
    return this;
};

MIDI.prototype.note = function () {
    var args = argsToArray(arguments);
    this.params.note = convert(args);
    return this;
};

MIDI.prototype.pitchbend = function () {
    var args = argsToArray(arguments);
    this.params.pitchbend = convert(args);
    return this;
};

MIDI.prototype.for = function () {
    var args = argsToArray(arguments);
    this.params.duration = convert(args);
    return this;
};

MIDI.prototype.ch = MIDI.prototype.channel = function () {
    var args = argsToArray(arguments);
    this.params.channel = convert(args);
    return this;
};

dtm.startWebMidi();
/**
 * @fileOverview Singleton master (conductor) module. Wants to oversee and control everything, but not quite there yet.
 * @module master
 */

dtm.master = {
    type: 'dtm.master',

    params: {
        data: null,
        index: 0,

        level: 0.5,
        mute: false,

        tempo: 120,
        time: [4, 4],

        beat: 0,
        measure: 0,
        section: 0,

        scale: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        cummulatedRhythm: null,

        transposition: 0,
        chord: null,
        tonalFunc: null,

        maxNumVoices: 500,
        voices: []
    },


    /**
     * Total complexity thing.
     * @name module:master#totalComplexity
     * @type {integer}
     */
    totalComplexity: 0,
    complexityLimit: 10,
    numActiveModels: 0, // or active voices??

    activeInstrs: [],
    voices: [],
    maxNumVoices: 0,
    models: [],

    /**
     * Returns the master clock (singleton).
     * @function module:master#clock
     * @returns clock {object}
     */
    clock: dtm.clock(120, 480).sync(false),

    start: function () {
        return dtm.master;
    },

    /**
     * Stops and deletes all the running clock.
     * @function module:master#stop
     */
    stop: function () {
        dtm.clocks.forEach(function (c) {
            c.stop();
            c.clear();
        });

        dtm.master.activeInstrs.forEach(function (i) {
            i.stop();
        });

        dtm.clocks = [];
        dtm.master.voices = [];

        dtm.master.activeInstrs = [];

        dtm.params.traced.forEach(function (d) {
            d.params.trace = false;
        });
    },

    /**
     * Transpose all the voices that are synced to the master.
     * @function module:master#transpose
     * @param val
     * @returns {*}
     */
    transpose: function (val) {
        dtm.master.transposition = val;
        return dtm.master;
    },

    ///**
    // * Pitch quantize all the voices that are synced to the master.
    // * @function module:master#pq
    // * @returns {*}
    // */
    //pq: function () {
    //    var scale;
    //
    //    if (arguments.length === 0) {
    //        scale = dtm.gen('range', 12).get();
    //    } else if (isArray(arguments[0])) {
    //        scale = arguments[0];
    //    } else if (isString(arguments[0])) {
    //        scale = dtm.scales[arguments[0].toLowerCase()];
    //    } else {
    //        scale = arguments;
    //    }
    //
    //    dtm.master.scale = scale;
    //
    //    // TODO: update all the voices as well?
    //
    //    return dtm.master;
    //},

    data: function (d) {
        if (!isEmpty(d)) {
            dtm.master.params.data = d;
        }

        return dtm.master;
    },

    model: function () {
        return dtm.master;
    },

    get: function (param) {
        switch (param) {
            case 'index':
                return dtm.master.params.index;
                break;

            case 'clock':
                return dtm.master.clock;

            default:
                return null;
        }
    },

    set: function (key, val) {
        return dtm.master;
    },

    setNumVoices: function (num) {
        if (isInteger(num) && num > 0) {
            dtm.master.params.maxNumVoices = num;
        }

        return dtm.master;
    },

    suppressVoices: function () {
        if (dtm.master.params.voices.length > dtm.master.params.maxNumVoices) {
            dtm.master.params.voices[0].stop();
            dtm.master.params.voices.splice(0, 1);
            dtm.master.suppressVoices();
        }

        return dtm.master;
    },

    addVoice: function (voice) {
        dtm.master.params.voices.push(voice);
        dtm.master.suppressVoices();

        return dtm.master;
    },

    removeVoice: function (voice) {
        dtm.master.params.voices.forEach(function (v, i) {
            if (v.get('id') === voice.get('id')) {
                dtm.master.params.voices.splice(i, 1);
            }
        });

        return dtm.master;
    },

    panic: function () {
        dtm.master.params.voices.forEach(function (v) {
            v.stop();
        });

        dtm.master.params.voices = [];
        return dtm.master;
    },

    state: null,

    reset: null
};

dtm.master.clock.setMaster(true);
dtm.master.clock.start();
dtm.guido = {
    pitchClass: {
        '-1': '_',
        'r': '_',
        0: 'c',
        1: 'd&',
        2: 'd',
        3: 'e&',
        4: 'e',
        5: 'f',
        6: 'f#',
        7: 'g',
        8: 'a&',
        9: 'a',
        10: 'b&',
        11: 'b'
    },

    diatonic: {
        'c': 0,
        'd': 2,
        'e': 4,
        'f': 5,
        'g': 7,
        'a': 9,
        'b': 11,
        '_': null
    },

    nnToPitch: function (nn) {
        var pc = dtm.guido.pitchClass[mod(nn, 12)];
        var oct = (nn - mod(nn, 12)) / 12 - 4;
        return pc + oct.toString();
    },

    pitchToNn: function (sym) {
        var elems = sym.split('');

        var acc = 0;
        var oct = 0;

        var pc = dtm.guido.diatonic[elems[0]];

        if (elems.length === 2) {
            oct = (parseInt(elems[1]) + 4) * 12;
        } else if (elems.length > 2) {
            if (elems[1] == '#') {
                acc = 1;
            } else if (elems[1] == '&') {
                acc = -1;
            }

            if (elems.length === 3) {
                if (elems[1] == '-') {
                    oct = (parseInt(elems[1]+elems[2]) + 4) * 12;
                } else {
                    oct = (parseInt(elems[2]) + 4) * 12;
                }
            } else if (elems.length === 4) {
                oct = (parseInt(elems[2] + elems[3]) + 4) * 12;
            }
        }

        return pc + acc + oct;
    }
};
dtm.inscore = function () {
    var inscore = {
        type: 'dtm.inscore',
        oscPort: {}
    };

    inscore.setup = function () {
        inscore.oscPort = new osc.WebSocketPort({
            url: 'ws://localhost:8081'
        });

        inscore.oscPort.open();

        return inscore;
    };

    inscore.test = function (beats) {
        var seq = [];
        var pattern = [];

        // 4/4, 8th notes, 1 measure
        for (var i = 0; i < beats.length; i++) {
            var foo;

            if (mod(i, 2) === 0) {
                var down, up;
                down = beats[i];
            } else {
                up = beats[i];
                pattern = [down, up].join(', ');

                switch (pattern) {
                    case '1, 0':
                        seq.push('a/4');
                        break;
                    case '1, 1':
                        seq.push('a/8');
                        seq.push('a/8');
                        break;
                    case '0, 0':
                        seq.push('_/4');
                        break;
                    case '0, 1':
                        seq.push('_/8');
                        seq.push('a/8');
                        break;
                    default:
                        break;
                }
            }
        }

        seq = seq.join(' ');

        //for (var i = 0; i < 5; i++) {
        //    seq[i] = String.fromCharCode("a".charCodeAt(0) + Math.floor((Math.random() * 8)));
        //}

        //seq = seq.join(' ');

        inscore.oscPort.send({
            address: '/ITL/scene/score',
            args: ['write', seq]
        });

        return inscore;
    };

    inscore.write = function (input) {
        inscore.oscPort.send({
            address: '/ITL/scene/score',
            args: ['write', input]
        });

        return inscore;
    };

    return inscore;
};
(function () {
    var m = dtm.model('unipolar').register();
    var a = dtm.array();

    var min, max;

    m.default(function () {
        if (arguments.length === 1) {
            var arg = arguments[0];

            if (isNumber(arg)) {
                a.set(arg);
            } else if (typeof(arg) === 'string') {
                a.set(arg).split().classify();
            } else if (isArray(arg)) {
                if (isNumOrFloat32Array(arg)) {
                    a.set(arg);
                } else {
                    a.set(arg).split().classify();
                }
            } else if (isDtmArray(arg)) {
                a = arg.clone();

                if (a.get('type') === 'string') {
                    a.classify();
                }
            }
        } else if (arguments.length > 1) {
            var args = argsToArray(arguments);

            if (isNumOrFloat32Array(args)) {
                a.set(args);
            } else if (isStringArray(args)) {
                a.set(args).split().classify();
            }
        }

        return a.normalize(min, max);
    });

    m.domain = function () {
        if (argsAreSingleVals(arguments) && arguments.length == 2) {
            var args = argsToArray(arguments);
            if (isNumOrFloat32Array(args)) {
                min = args[0];
                max = args[1];
            }
        } else if (argIsSingleArray(arguments)) {
            if (isNumOrFloat32Array(arguments[0]) && arguments[0].length == 2) {
                min = arguments[0][0];
                max = arguments[0][1];
            }
        }
    };

    return m;
})();
(function bipolarModel() {
    var m = dtm.model('bipolar').register();
    var a = dtm.array();

    var min, max;

    m.default(function () {
        if (arguments.length === 1) {
            var arg = arguments[0];

            if (isNumber(arg)) {
                a.set(arg);
            } else if (isString(arg)) {
                a.set(arg).split().classify();
            } else if (isArray(arg)) {
                if (isNumOrFloat32Array(arg)) {
                    a.set(arg);
                } else {
                    a.set(arg).split().classify();
                }
            } else if (isDtmArray(arg)) {
                a = arg.clone();

                if (a.get('type') === 'string') {
                    a.classify();
                }
            }
        } else if (arguments.length > 1) {
            var args = argsToArray(arguments);

            if (isNumArray(args)) {
                a.set(args);
            } else if (isStringArray(args)) {
                a.set(args).split().classify();
            }
        }

        return a.normalize(min, max).range(-1, 1);
    });

    m.domain = function () {
        if (argsAreSingleVals(arguments) && arguments.length == 2) {
            var args = argsToArray(arguments);
            if (isNumArray(args)) {
                min = args[0];
                max = args[1];
            }
        } else if (argIsSingleArray(arguments)) {
            if (isNumArray(arguments[0]) && arguments[0].length == 2) {
                min = arguments[0][0];
                max = arguments[0][1];
            }
        }
    };

    return m;
})();
(function () {
    var m = dtm.model('huffman').register();

    var chordDict = [];

    m.build = function () {
        console.log('meow');
        return m;
    };

    return m;
})();
(function () {
    var m = dtm.model('mtf').register();
    var a = dtm.array();

    var table;
    var res = [];
    var spliced, index;

    m.default(function () {
        // with dtm.array
        var input = arguments[0];

        table = input.get('classes');

        input.forEach(function (v) {
            index = table.indexOf(v);
            res.push(index);
            spliced = table.splice(index, 1);
            table.unshift(spliced[0]);
        });

        return a.set(res);
    });

    m.getTable = function () {
        return table;
    };

    return m;
})();
(function () {
    var i = dtm.model('image-scan').register();
    var data = dtm.a();
    var dur = 30;
    var scale = dtm.a([0,4,5,7,10,14]);
    var numVoices = 100;

    i.data = function (d) {
        data = d.t();

        return i;
    };

    i.play = function () {
        setTimeout(function () {
            new Promise(function (resolve, reject) {
                var mu = data().each.mean().flatten().range(0,70,0,1).save();
                var sc = dtm.scale()
                    .filter(function (s) {
                        return s.get('name') !== 'chromatic';
                    })
                    .max(function (s) {
                        return mu().pq(s).snr().get(0);
                    }).flatten();
                resolve(sc);
            }).then(function (scale) {
                data.r(0,70,0,1).pq(scale);

                data.forEach(function(a,i){
                    if (i % Math.ceil(data.length/numVoices) === 0) {
                        dtm.syn().play().dur(dur)
                            .amp(
                                dtm.array(3/numVoices)
                                    .mult(dtm.rise())
                            )
                            .nn(
                                dtm.array(30)
                                    .add(a)
                                    .add(dtm.rand(1,-0.2,0.2))
                            )
                            .pan(i/data.length * 2 - 1)
                            .delay();
                    }
                });
            });
        }, 0);
        return i;
    };

    i.dur = function (val) {
        dur = val;
        return i;
    };

    i.pq = function (scale) {
        scale = dtm.scale(scale);
        return i;
    };

    i.scale = i.pq;

    i.numVoices = function (num) {
        numVoices = num;
        return i;
    };

    i.voice = i.voices = i.numVoices;

    return i;
})();
})();