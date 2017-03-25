/* ANGULAR */

var memberApp = angular.module("memberApp", []);

memberApp.controller("mainController", function($scope, $http){

    $http.post("/member")
        .then(
            //success
            function(data){
                console.log(data.data);
            },
            //error
            function(data){
                console.log("Error: " + data);
            }
        );
});


/* GOOGLE MAP */
function initMap() {

    //geocoder
    var geocoder = new google.maps.Geocoder;

    //center the map on (uluru?)
    var uluru = {lat: -25.363, lng: 131.044},
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: uluru
        });

    //create an array to hold marker objects
    var markers = [];

    //listen for click events on the map
    google.maps.event.addListener(map, "click", function(event){
        //geodecode (lat-long to location name)
        var location = {"location": {
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng()
                        }};
        geocoder.geocode(location, function(results, status) {
            //adds read address (if possible) to location object
            if (status === "OK"){
                location.addr = results[0].formatted_address;
                //use regular expression to change all whitespace characters to hyphens
                location.id = location.addr.replace(/\W+/g, "-");
                location.latLng = event.latLng;
                location.images = [];
                createMarker(location);
            }
        });
    });

    function createMarker(location){

        //on click, create new marker at mouse x,y
        var marker = new google.maps.Marker({
            position: location.latLng,
            map: map
        });

        //center map
        map.panTo(location.latLng);

        //for that marker, create an infoWindow object
        //(one infoWindow per marker)
        var infoWindow = new google.maps.InfoWindow({
            content: getInfoWindow(location)
        });

        //open infoWindow right away
        infoWindow.open(map, marker);

        //when infoWindow is ready...
        google.maps.event.addListener(infoWindow, "domready", function(){

            //add event listeners on new infoWindow
            infoWindowGalleriaListeners(document.querySelector("#" + location.id).parentNode);

        });

        //add click event listener on marker
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });

        function infoWindowGalleriaListeners(infoWindow){
            //menu button
            infoWindow.querySelector("h1 button:first-of-type").addEventListener("click", addImage);
            //delete marker button
            infoWindowRemovalListener(infoWindow);
            //start Galleria
            var id = infoWindow.querySelector(".galleria").id;
            Galleria.run("#" + id);
        }

        function infoWindowAddImageListeners(infoWindow){
            //menu button
            infoWindow.querySelector("h1 button:first-of-type").addEventListener("click", function(e){
                cleanupAddImage(infoWindow);
            });

            //delete marker button
            infoWindowRemovalListener(infoWindow);
        }

        function infoWindowRemovalListener(infoWindow){
            //add click event listener on second button (delete marker)
            infoWindow.querySelector("h1 button:last-of-type").addEventListener("click", function(){
                console.log("removeMarker");
                if (confirm("Remove marker?")){
                    marker.setMap(null);
                    marker = infoWindow = null;
                }
            });
        }

        function getInfoWindow(location){
            //get html string for location's infoWindow
            var html = "<section class='infoWindow'><h1>" + location.addr + "<button>&equiv;</button><button>&times</button></h1>";
            html += "<div id='" + location.id + "' class='galleria'>";
            html += getImages(location);
            html += "</div></section>";
            return html;
        }

        function getImages(location){
            //get html string for location's images
            var html = "";
            for (var i=0; i<location.images.length; i++){
                let img = location.images[i];
                html += "<img data-title='" + img.title + "' data-description='" + img.description + "' src='" + img.src + "' />";
            }
            return html;
        }

        function addImage(e){
            //menu button has been clicked on in an infoWindow
            var infoWindow = e.target.parentNode.parentNode;

            //hide the Galleria
            infoWindow.querySelector(".galleria").className += " hide";

            //replace it with a form
            infoWindow.innerHTML += "<form method='POST' enctype='multipart/form-data'><input name='title' placeholder='image title' /><input name='description' placeholder='image description' /><input type='file' name='photo' /><input type='submit' value='Add Image' /></form>";

            //put cursor in first input
            infoWindow.querySelector("form input").focus();

            //add event listener on the submit button
            infoWindow.querySelector("input[type='submit']").addEventListener("click", function(e){
                e.preventDefault();

                var photoData = new FormData(),
                    title = infoWindow.querySelector("input[name='title']").value,
                    desc = infoWindow.querySelector("input[name='description']").value,
                    photo = infoWindow.querySelector("input[name='photo']").files[0];
                photoData.append("title", title);
                photoData.append("description", desc);
                photoData.append("photo", photo);

                $.ajax({
                    url: "/addphoto",
                    type: "POST",
                    data: photoData,
                    processData: false,
                    contentType: false
                }).then(
                    //success
                    function(data){
                        console.log(data);
                        //add photo to Galleria
                        var images = [...infoWindow.querySelectorAll(".galleria img")].join("");
                        images += "<img data-title='" + data.title + "' data-description='" + data.description + "' src='uploads/" + data.filename + "' />";
                        infoWindow.querySelector(".galleria").innerHTML = images;
                        cleanupAddImage(infoWindow);
                    },
                    //error
                    function(data){
                        console.log("Error: ", data);
                        cleanupAddImage(infoWindow);
                    }
                );
            });

            //reassign button events
            infoWindowAddImageListeners(infoWindow);
        }

        function cleanupAddImage(infoWindow){ //remove form and revert to Galleria
            //remove form and reset innerHTML
            infoWindow.removeChild(infoWindow.querySelector("form"));
            infoWindow.innerHTML += ""; // <-- hacky TODO: fix this?

            //show Galleria again
            var galleria = infoWindow.querySelector(".hide");
            galleria.className = "galleria";
            //Galleria.run(galleria);

            //reassign button events
            infoWindowGalleriaListeners(infoWindow);
        }
    }

}
