/*
 * Copyright (c) 2013 Joe Schulkins 
 * 
 * This software and associated documentation files (the "Software") are available 
 * under a Creative Commons CC-BY-SA (http://creativecommons.org/licenses/by-sa/3.0/legalcode).
 * Feel free to do with it what you will.
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

// create an array to hold the item objects
var itemObj = new Array;

// check the length e.g. if there is content of div etc. 
function lenChk(term){
	var lenRsp;
	if(term.length > 0){
		lenRsp = true;
	}
	else{
		lenRsp = false;
	}
	return lenRsp;
}

/*
 * Item Object and its properties
 * classM = classmark
 * format = based on value in leader, set to monograph or serial
 * library = owning library
 * leader = the leader 
 * status = the item's current availability
 * url = the html surrounding the owning library text
 */
function ItemObj(classM,format,library,leader,status,url){
	this.classM = classM;
	this.format = format;
	this.library = library;
	this.leader = leader;
	this.status = status;
	this.url = url;

}

/* 
 * get the JSON files using JSONP this allows for cross domain access.
 * urlS = the url of the json file
 * jsonpCallbackS = the variable name of the JSON object
 * dataSource = the variable name for where the result should go to
 * completeA = the function name to execute when the ajax completes
 */
function ajaxFun(urlS,jsonpCallbackS,dataSource,completeA){
	$.ajax({
			type: "GET",
			url: urlS,
			jsonpCallback: jsonpCallbackS,
			contentType: "application/json",
			dataType: "json",
			cache: false,
			success: function(source){
				window[dataSource] = source;
				},
			complete: function(){
				if(completeA !== undefined){
					window[completeA]();
				}
				else{
					return;
				}
			},
			error: function(){
				console.log('error');
			}
	});
}

/*
 * removing whitespace at beginning and end of string as trim() isn't compatible with IE prior to 9:
 * http://stackoverflow.com/questions/3000649/trim-spaces-from-start-and-end-of-string
 */ 
function trim11 (str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

/*
 * get information about the items - the Library, Classmark, the format (taken from the LEADER), availability, URL etc.
 * create the item objects and push them to the itemObj array
 * 
 */  
function itemInfo(){
	
	tableRow = $(' .bibItemsEntry');
	
	// loop through every table row under the bibItems class this will put all items in the table into an array
	for(i = 0; i < tableRow.length; i++){
		
		// we have a nbsp preceeding our Library location, so we need to remove this nbsp before we can use the location. 
		library = $(tableRow[i]).children("td:nth-child(1)");
		
		// take the html in the row as the default location URL and text
		url = $(library).html();
		
		// get the library and remove unnecessary whitespace
		library = trim11($(library).text());

		// access the LEADER for format information
		leader = $("td .bibInfoLabel:contains('Leader')").next().text();
	
		// take the eighth character from the leader. this should be 'm' or 's' to denote format.
		format = trim11(leader.charAt(8));
	
		// based on the character in the leader, set format to monograph or serial
		if(format === "m"){
			format = "monograph";
		}
		else if(format === "s"){
			format = "serial";
		}
				
		// get the second child (ie second cell) of the row with the class bibItemsEntry as this contains our classmark 
		classMark = trim11($(tableRow[i]).children("td:nth-child(2)").text());
		
		// get the third child (ie third cell) of the row with the class bibItemsEntry as this contains item status 
		avail = trim11($(tableRow[i]).children("td:nth-child(3)").text());

		// create new objects
		if(library.length){
			itemObj.push(new ItemObj(classMark, format, library, leader, avail,url));
		}
	
	}
}

/*
 * take the item index, library, format, classmark and url searching expData and mainData for the appropriate
 * location based on classmark and create a new url.
 */
function dispLocn(itemIndex, library, format, classM, url){
	 	var classCut = new Array(), lkClass, thrClass, splitClass;
	 	
	 			// split the classmark by '.' and retrieve first portion
	 			var newClass = classM.split(/\.(?![^\[\]]*\])/)[0];
				
				// if the classmark begins with a letter, followed by another letter, followed by a number
				if(newClass.match(/^[A-z][A-z][0-9]/)){
					
					// slice the classMark into an array to check whether it appears in our exceptions
					var parts = newClass.match(/(\D+)(\d.+)/).slice(1);
				
					// set lkClass to the first element of the array i.e. the two letters, the number part make up the second element parts[1]
					lkClass = parts[0];
					
					var nkClass = lkClass.charAt(0);
					
					// this loop will go through the alphabet until it reaches a match or it runs out of letters					
					for(i = 0; i <= 25; i++){
						
						var str = String.fromCharCode('A'.charCodeAt() + i);
						
						/* use the first letter of the item's classmark and the one from str starting at 'A' to
						 * go through the exceptions file
						 */
						var oClass = nkClass + str;

						// if a match is found in the exceptions file, push this to the classCut array and exit the loop
						if(expData[library][format][oClass]){
							classCut.push(expData[library][format][oClass]);
						}
		
					}
					
				}
				// if the classmark begins with three letters
				else if(newClass.match(/^[A-z][A-z][A-z]/)){
					
					// set lkClass to the first three letters 
					lkClass = String(newClass).substring(0,3);
			
					// create a new variable to be used to get straight to classmarks with three characters
					thrClass =  String(newClass).substring(0,3);
				}
				
				// if the classmark starts with a digit
				else if(newClass.match(/^[0-9]/)){
					// set lkClass to the first number
					lkClass = Number(newClass).toPrecision(1);
				}
				
				
				// if something was found in the exceptions compare the numbers
				if(classCut[0] !== undefined){
					function getExp(array){
					$.each(array, function(key, value){	
							// compare the number element from the classmark with the returned key
							if(Number(parts[1]) >= Number(value.number)){						
								// if the number is equal to or greater than the key in the exceptions and assign to split_class
								splitClass = value.newCls;
							  }
 
							else{
								if(lkClass > oClass){
									splitClass = value.newCls;
									
								}
								else{
							  	splitClass = classM.charAt(0);
								}
							  }
						});
					
					}
					// pass through the item in the classCut array to get the new value to look at from the main data file
					getExp(classCut);
				}
				else if(classCut[0] === undefined){
					// if the classmark starts with 3 letters (e.g. FIL, BUF), use this for the lookup	
					if(thrClass !== undefined){
						splitClass = thrClass;
					}
					else{
						// if no exception just trim the classMark to match our lookup file and retrieve the first letter of the classMark for lookup
						splitClass = classM.charAt(0);
					}	
				}
					
				// get the location text and location URL attrributes for the classmark		
				locnURL = mainData[library][format][splitClass].locnURL;	
				fullLocn = mainData[library][format][splitClass].fullLocn;
	
				if(fullLocn !== undefined){	
					
					/* create an href for the location of the item using the information from the JSON files
					 * using fancybox http://fancyapps.com/fancybox and a home made floor plan
					 */ 					
					itemObj[itemIndex].url = '<a class="fancybox" rel="group" title="Your classmark is ' + classM + '" href="' +
						 locnURL + '">'+library+'<br />'+fullLocn+'</a>';	
	
				}
				else{
					return;
				}

}

/*
 * replace the current html
 */
function htmlTableFindReplace(find,replace){
		for(var i=0; i <= find.length; i++){
			replacement = find[i];
			if(replace[i]){
			replacement = $(replacement).children("td:nth-child(1)").html(replace[i].url);
			}
			else{
				return;
			}
		}
}

/*
 * call itemInfo then for each item in the itemObj array, send the index, library, format, 
 * classmark and url.
 * call htmlTableFindReplace to change the url to the new one as recorded in the json files
 */
function setItmURL(){
		itemInfo();
		$.each(itemObj, function(index, value){
			dispLocn(index,value.library,value.format,value.classM,value.url);
		});
		// call the url replacement function
		htmlTableFindReplace(tableRow,itemObj);
}

/*
 * run the item look up and apply the fancybox class to the result
 */ 
function itemLocn(expData,mainData){
	//retrieve exception data
	if(expData === undefined){
	expData = ajaxFun("http://libapps.liv.ac.uk/jQuery/library/location/locn_except.json?callback=?","exp","expData");
	}
	//retrieve the main location data
	if(mainData === undefined){
	mainData = ajaxFun("http://libapps.liv.ac.uk/jQuery/library/location/locations.json?callback=?","main","mainData","setItmURL");
	}
	//apply fancybox and its settings
	$(".fancybox").fancybox({
		maxWidth	: 800,
		maxHeight	: 600,
		fitToView	: false,
		width		: '70%',
		height		: '70%',
		autoSize	: false,
		closeClick	: true,
		openEffect	: 'none',
		closeEffect	: 'none',
		prevEffect	: 'none',
		netxEffect	: 'none',
		arrows		: false,
		helpers : {
		title: {
				type: 'inside'
				}
		} 
	});
}


