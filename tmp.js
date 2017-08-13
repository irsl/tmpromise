(function(){
	const path = require("path")

	module.exports = function(options){

	  if(typeof options != "object") throw new Error("options should be a hash")
	  if(!options.data) throw new Error("data to be written should be specified")
	  if(!options.callback) throw new Error("leave me alone without a callback")
	  
	  const fs = require("fs")

	  var tempName = generateName(options.pathOptions);
	  return writeFileAsync(tempName, options.data, options.writeOptions)
		.then(()=>{
		  var wasException
		  var response
		  var p;
		  try{
			p = options.callback(tempName)
		  }catch(ex){
			p = Promise.reject(ex)
		  }
		  if((!p)||(!p.then)) p = Promise.resolve(p)
		  return p
			.then(d=>{
			  response = d
			})
			.catch(ex=>{
			  wasException = ex
			})
			.then(()=>{
			   return unlinkAsync(tempName)
			})
			.then(()=>{
			   if(wasException) throw wasException
			   return Promise.resolve(response)
			})
		})
		
		function writeFileAsync(filename, data, options){
		   return new Promise((resolve,reject)=>{
			  return fs.writeFile(filename, data, options, function(err){
				 if(err) return reject(err)
				 return resolve()
			  })
		   })
		}
		
		function unlinkAsync(filename){
		   return new Promise((resolve,reject)=>{
			  return fs.unlink(filename, function(err){
				 if(err) return reject(err)
				 return resolve()
			  })
		   })
		}	
		
		// the below two functions are coming from https://github.com/bruce/node-temp
		function generateName(rawAffixes, defaultPrefix) {
		  var affixes = parseAffixes(rawAffixes, defaultPrefix);
		  var now = new Date();
		  var name = [affixes.prefix,
					  now.getYear(), now.getMonth(), now.getDate(),
					  '-',
					  process.pid,
					  '-',
					  (Math.random() * 0x100000000 + 1).toString(36),
					  affixes.suffix].join('');
		  return path.join(affixes.dir || module.exports.ostmpdir, name);
		};

		function parseAffixes(rawAffixes, defaultPrefix) {
		  var affixes = {prefix: null, suffix: null};
		  if(rawAffixes) {
			switch (typeof(rawAffixes)) {
			case 'string':
			  affixes.prefix = rawAffixes;
			  break;
			case 'object':
			  affixes = rawAffixes;
			  break;
			default:
			  throw new Error("Unknown affix declaration: " + affixes);
			}
		  } else {
			affixes.prefix = defaultPrefix;
		  }
		  return affixes;
		};
		
	}

	module.exports.ostmpdir = path.resolve(require("os").tmpdir());

})()
