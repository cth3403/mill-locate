/**
 * @author joesch
 * 
 * This handles the DOM manipulation an executes the functions laid out in func.js 
 * 
 */
$(document).ready(function(){
	
	// run item level functions
	if(lenChk($('div .bibDisplayContentMain')) === true){
		
		// set the item location to something meaningful
		var expData,mainData;
		itemLocn(expData,mainData);

	}
	else{
		return false;
	}
});