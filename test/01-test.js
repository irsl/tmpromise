const assert = require("assert");

describe('basic tests', function() {
   const tmpromise = require("../tmp.js")
   const fs = require("fs")
   
   it("generic tmp file usecase", function(done){
      const expectedData = "foo"
	  const expectedResponse = "hello"
	  var tmpName
      return tmpromise({data: expectedData, callback: function(aTmpName){
	     tmpName = aTmpName
	     return readFileAsync(tmpName, "utf-8")
		   .then(data=>{
      		 assert.equal(data, expectedData)
			 return Promise.resolve(expectedResponse)
		   })
	  }})
	  .then((d)=>{
	    assert.equal(d, expectedResponse)
	    return shouldNotExist(tmpName)
	  })
	  .then(()=>{
		 done()
	  })
	  .catch(done)
   })

   
   it("should be good even if not returning a promise", function(done){
      const expectedData = "foo"
	  var tmpName
      return tmpromise({data: expectedData, callback: function(aTmpName){
	     tmpName = aTmpName
	     var data = fs.readFileSync(tmpName, "utf-8")
		 assert.equal(data, expectedData)
	  }})
	  .then(()=>{
	    return shouldNotExist(tmpName)
	  })
	  .then(()=>{
		 done()
	  })
	  .catch(done)
   })

   it("when callback throws", function(done){
      const expectedData = "foo"
	  var tmpName
      return tmpromise({data: expectedData, callback: function(aTmpName){
	     tmpName = aTmpName
		 throw new Error("just because")
	  }})
	  .catch(ex=>{
	     assert.equal(ex.message, "just because")
	     return shouldNotExist(tmpName)		 
	  })
	  .then(()=>{
		 done()
	  })
	  .catch(done)
   })
   
   it("when callback rejects", function(done){
      const expectedData = "foo"
	  var tmpName
      return tmpromise({data: expectedData, callback: function(aTmpName){
	     tmpName = aTmpName
		 return Promise.reject(new Error("just because"))
	  }})
	  .catch(ex=>{
	     assert.equal(ex.message, "just because")
	     return shouldNotExist(tmpName)		 
	  })
	  .then(()=>{
		 done()
	  })
	  .catch(done)
   })

   
   function shouldNotExist(fn){
      return readFileAsync(fn)
	    .then(()=>{
		  throw new Error("Should not exists")
		})
	    .catch(ex=>{
		  if(ex.code == "ENOENT") return Promise.resolve()
		  throw ex
		})
   }
   
   function readFileAsync(fn, options) {
      return new Promise((resolve,reject)=>{
		  return fs.readFile(fn, options, function(err, data){
              if(err) return reject(err)
              resolve(data)			  
		  })
	  })
   }
   
})
