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

/* set variables used throughout.
 * expData = stores the exception JSON data and is use where the location info is different from the default
 * mainData = stores the default location info
 * itemObj = an array made up of each of the item's info from the record display
 * classCut = an array formed of parts of the classmark (the classmark is broken down by '.')
 * tableRow = this stores all the items found in the table under the BibItems class
 * library = stores the library of the item
 * leader = stores the leader associated with the bib record
 * format = stores the format based on the value in the leader
 * classMark = store the complete classmark of the item
 * oClass = this will be used to check whether the current classmark is greater than the one given in the exceptions file
 * lkClass = stores the classmark which is just made up of the first portion of the classmark (e.g. 'QA512' from 'QA512.65.PED') 
 * thrClass = used for storing the classmark if it starts with three letters e.g. FIL
 * splitClass = is used if a classmark is split across multiple floors or locations
 * newClass = splits the classMark using a regexp into parts separated by'.'
 * parts = slices the first part of the classmark so that we only get the letters at the beginning
 * nkClass = used to check whether the current classmark is greater than the one in the exceptions file
 * str = is a letter of the alphabet starting at 'A' and is incremented until a match in the exceptions or until reaching 'Z'
 * locnURL = get the URL of the image for the location from either the exceptions or main data file
 * fullLocn = get the text label for the location from either the exceptions or the main data file
 * htmlLocn = set the href of the element to this if the script is unable to get the fullLocn & locnURL 
 * leaderTidy = the variable used for tidying the leader from the bib display
 */

var expData, mainData, itemObj = new Array(), classCut = new Array(), tableRow, library, leader, format, classMark, avail, oClass, lkClass, thrClass = 0, splitClass = 0, newClass, parts, nkClass, str, getExp, locnURL, fullLocn, htmlLocn, leaderTidy;


// item class
function ItemObj(classM,format,library,leader,status){
	this.classM = classM;
	this.format = format;
	this.library = library;
	this.leader = leader;
	this.status = status;
}

/* get the JSON files using JSONP this allows for cross domain access
 * this is called once the page is loaded and will retrieve the exceptions file by default
 */
function ajaxFun(urlS,jsonpCallbackS,dataSource){
	$.ajax({
			type: "GET",
			url: urlS,
			async: false,
			jsonpCallback: jsonpCallbackS,
			contentType: "application/json",
			dataType: "jsonp",
			cache: false,
			success: function(source){
			if(dataSource === "expData"){
				expData = source;
				// get the main data file - the URL will need to be changed to the location of your JSON file
				ajaxFun("http://libapps.liv.ac.uk/jQuery/library/location/locations.json?callback=?","main","mainData");
			}
			else if(dataSource === "mainData"){
				mainData = source;
				// start getting the information about the items on the page
				itemInfo();
			}
			else{
				console.log('data not set');
			}
			},
			error: function(classData){
				console.log('error');
			}
	});
}

// get information about the items - the Library, Classmark, the format (taken from the LEADER) 
function itemInfo(){
	
	tableRow = $('.bibItems > tbody  > tr');
	
	// loop through every table row under the bibItems class this will put all items in the table into an array
	for(i = 0; i < tableRow.length; i++){
		
		// we have a nbsp preceeding our Library location, so we need to remove this nbsp before we can use the location. 
		library = $(tableRow[i]).children("td:nth-child(1)");
		//NOTE: trim() doesn't work with IE8
		library = $(library).text().trim();
	
		// access the LEADER for format information
		leader = $("td .bibInfoLabel:contains('Leader')");
	
		leader = $(leader).next().text();
	
		// take the eighth character from the leader. this should be 'm' or 's' to denote format. NOTE: trim() doesn't work with IE8 
		format = leader.trim().charAt(7);
	
		// based on the character in the leader, set format to monograph or serial
		if(format === "m"){
			format = "monograph";
		}
		else if(format === "s"){
			format = "serial";
		}
				
		// get the second child (ie second cell) of the row with the class bibItemsEntry as this contains our classmark 
		classMark = $(tableRow[i]).children("td:nth-child(2)").text().trim();
		
		// get the third child (ie third cell) of the row with the class bibItemsEntry as this contains item status 
		avail = $(tableRow[i]).children("td:nth-child(3)").text().trim();

		// create new objects
		if(library.length){
			itemObj.push(new ItemObj(classMark, format, library, leader, avail));
		}
	
	}
	dispLocn();
}

function dispLocn(){
	
	// go through each item from the itemObj array looking at their library, format and classmark 
	$.each(itemObj, function(index, value){ 
		library = value.library;
		format = value.format;
		classMark = value.classM;
		leaUpdate = value.leader;

		// we only want physical locations, we don't want to include electronic - change these values to your library locations
		if(library === "Sydney Jones Library" || library === "Harold Cohen Library"){
			
			// we're just interested in monographs and serials
			if(format === "monograph" || format === "serial"){
				
				// split the classmark by '.' into an array
				newClass = classMark.split(/\.(?![^\[\]]*\])/);
				
				// if the classmark begins with a letter, followed by another letter, followed by a number
				if(newClass[0].match(/^[A-z][A-z][0-9]/)){
					
					// slice the classMark into an array to check whether it appears in our exceptions
					parts = newClass[0].match(/(\D+)(\d.+)/).slice(1);
				
					// set lkClass to the first element of the array i.e. the two letters, the number part make up the second element parts[1]
					lkClass = parts[0];
					
					nkClass = lkClass.charAt(0);
					
					// this loop will go through the alphabet until it reaches a match or it runs out of letters					
					for(i = 0; i <= 25; i++){
						
						str = String.fromCharCode('A'.charCodeAt() + i);
						
						// use the first letter of the item's classmark and the one from str starting at 'A' to
						// go through the exceptions file
						oClass = nkClass + str;

						// if a match is found in the exceptions file, push this to the classCut array and exit the loop
						if(expData[library][format][oClass]){
							classCut.push(expData[library][format][oClass]);
							break;
						}
		
					}
					
				}
				
				// if the classmark begins with three letters
				else if(newClass[0].match(/^[A-z][A-z][A-z]/)){
					
					// set lkClass to the first three letters 
					lkClass = String(newClass[0]).substring(0,3);
			
					// create a new variable to be used to get straight to classmarks with three characters
					thrClass =  String(newClass[0]).substring(0,3);
				}
				
				// if the classmark starts with a digit
				else if(newClass[0].match(/^[0-9]/)){
					// set lkClass to the first number
					lkClass = Number(newClass[0]).toPrecision(1);
				}
				
				// if we don't already have something set by the exceptions look up, then try again for the other types of classmark
				if(classCut.length <= 0){
				// look at the exception data for the lkclass and push the result to the empty classCut array
				classCut.push(expData[library][format][lkClass]);
				}
				
				// if something was found in the exceptions compare the numbers
				if(classCut[0] !== undefined){
					function getExp(array){
					$.each(array, function(key, value){						
							// compare the number element from the classmark with the returned key
							if(Number(parts[1]) >= Number(value.number)){						
								// if the number is equal to or greater than the key in the exceptions
								// assign the value to split_class
								splitClass = value.newCls;
							  }
 
							else{
								if(lkClass > oClass){
									splitClass = value.newCls;
									
								}
								else{
							  	splitClass = classMark.charAt(0);
								}
							  }
						});
					
					}
					// pass through the item in the classCut array to get the new value to look at from the main data file
					getExp(classCut);
				}
				else if(classCut[0] === undefined){
					// if the classmark starts with 3 letters (e.g. FIL, BUF), use this for the lookup	
					if(thrClass !== 0){
						splitClass = thrClass;
					}
					else{
						// if no exception just trim the classMark to match our lookup file 
						// retrieve the first letter of the classMark for lookup
						splitClass = classMark.charAt(0);
					}	
				}
				else{
					console.log('error');
				}
	
				// get the location text and location URL attrributes for the classmark		
				locnURL = mainData[library][format][splitClass].locnURL;	
				
				fullLocn = mainData[library][format][splitClass].fullLocn;

				// get the table cell with the library in for updating
				htmlLocn = $('a:contains("'+ library+'")').parent();
		
				// we have a webpage which gives other details on where an item is located. We need to rewrite the url 
				// to include the information from the locations.json
				if(fullLocn !== undefined){	
					
					// create an href for the location of the item using the information from locations.json
					// using fancybox http://fancyapps.com/fancybox and a home made floor plan, the link becomes a map in a 
					// lightbox which includes the classmark of the item that the user is looking for.					
					htmlLocn = $(htmlLocn).html('<a class="fancybox" rel="group" title="Your classmark is ' + classMark + '" href="' +
						 locnURL + '">'+library+'<br />'+fullLocn+'</a>');

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
				else{
					// if no location is found in the JSON file, point to web page by default. If you don't have such a page just remove everything
					// but library from libUpdate.html(...)
					htmlLocn = libUpdate.html('<a href="http://www.liv.ac.uk/library/using/find-things.html">'+library+'</a>');
				}
			}
		}	
	});	
}


$(document).ready(function(){
	if($("#bibDisplayContent").length){
		//the URL will need to be changed to the location of your JSON exceptions file
		return ajaxFun("http://libapps.liv.ac.uk/jQuery/library/location/locn_except.json?callback=?","exp","expData");
	} 
	else{
		return false;
	}
});