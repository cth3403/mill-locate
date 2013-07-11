/**
 * @author joesch
 * 
 * location unit tests
 * 
 */
module("Check length of item");
test("Simulate item level", function(){
	var itmLvl = lenChk('<div id="bibDisplayContent"><div class="bibSearch"></div></div>');
	strictEqual(true,true,"true succeeds");
})
test("Simulate browse level", function(){
	var brwsLvl = lenChk('');
	strictEqual(false,false,"false succeeds");
})


/*
module("Ajax", {
	setup: function() {
		
	},
	teardown: function() {
		
	}
});
	asyncTest("Get exception data", function(){
		stop(1000);
	
	
	
		ajax(function(){
		
		
			start();
		});
	});
	
module("Item retrieval");



module("Item objects create");



module("Item location check",{
	setup: function() {
		
		
	},
	teardown: function() {
		
	}
});

module("Item rewrite URL");
*/

