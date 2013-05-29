Purpose
-------
This software is to turn the default item locations as displayed in the bibliographic record to something more meaningful. This would change them from just displaying the library as location to having the library and floor on which they're located. This text is turned into a link to a floorplan of that floor (see this [example](http://library.liv.ac.uk:2082/record=b2181135~S8 "catalogue record")).

How it works
------------
The software uses two JSON files to ascertain the correct location for an item based on its classmark. There is the main file (locations.json) which holds the default data and the exceptions file (locn_except.json) which is used to determine whether the default location is the correct one to be using. For example take the example QP101.K61 - the default location information (given in locations.json) is:

"Q" : {
	"fullLocn" : "Main Reading Room",
	"locnURL" : "http://lgimages.s3.amazonaws.com/data/imagemanager/30588/hcl-central-first.jpg"
	}

However the real location for this classmark is a different floor. In fact anything with a classmark greater than QA152 belongs on a different floor. If we look at the exceptions file (locn_except.json) we see the following:

"QA" : {
	   "number" : "152",
           "newCls" : "Q2"
	  }

If we then look at the Q2 line from the default locations we get the right location for this classmark:

"Q2" : {
	   "fullLocn" : "Stack Floor 5",
	   "locnURL" : "http://lgimages.s3.amazonaws.com/data/imagemanager/30588/hcl-stack5.jpg"
	   }

The software runs a check on the classmark which is taken from the item record to see whether the first letter matches the first letter of an exception in the exception file and if it does it will run through all alphabet to determine where the match occurs and grab the new location. Otherwise if no match is found in the exceptions file, it will use the default location.

How to use
----------
You will need to have the leader enabled in your bib display as this is used to determine whether something is a monograph or serial.
You will also need to include jQuery, (if you are going to use images in a lightbox in a similar way i.e. for the loaction links) Fancybox, and this software into the header (using Web Options > General Display and Behaviour > INSERTTAG_INHEAD).
The files locations.json and locn_except.json will need to be changed accordingly, but will need to keep the same format and hosted on a webserver. The urls for these files will need to be changed in the locn.commented.js. Once locn.commented.js is working on your staging server, compress using an online compression utility (such as the one which can be found at: http://refresh-sf.com/yui/) to minify the javascript to be used on your live server.  

Dependencies
------------
Fancybox  : http://fancyapps.com/fancybox/
jQuery  : http://jquery.com/ (latest version -- NOTE. 1.2 doesn't run on versions of IE less than 9)
The leader needs to be visible in the catalogue record (e.g. the setting in our webpub.def is: b|_|||Leader||b| (where | is the pipe character)).