function key(canvas) {
    var context = canvas.getContext('2d');
    var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    var l = pixels.data.length / 4;
    for (var i = 0; i < l; i++) {
        var r = pixels.data[i * 4 + 0];
        var g = pixels.data[i * 4 + 1];
        var b = pixels.data[i * 4 + 2];
        if (r > '235' && g < '20' && b > '235') {
            pixels.data[i * 4 + 3] = 0;
        };
    };
    context.putImageData(pixels, 0, 0);
};

var map = new OpenLayers.Map(
    'map',
    {maxResolution: 0.703125}
);

var wmscURL = [
    "http://wmsc1.terrapages.net/getmap?",
    "http://wmsc2.terrapages.net/getmap?",
    "http://wmsc3.terrapages.net/getmap?",
    "http://wmsc4.terrapages.net/getmap?"
];
var terrapagesStreetLayer = new OpenLayers.Layer.WMS(
    'TerraPages Street',
    wmscURL,
    {
        layers: 'UnprojectedStreet',
        format: 'image/jpeg'
    },
    {
        buffer: 1,
        isBaseLayer: true
    }
);
map.addLayer(terrapagesStreetLayer);
map.zoomToMaxExtent();

document.addEventListener('DOMContentLoaded', function (){
    var markersLayer = new OpenLayers.Layer.Markers('Countryballs');

    var req = new XMLHttpRequest();
    req.open('GET', 'http://krautchan.net/ajax/geoip/lasthour', true);
    req.onreadystatechange = function(e) {
        if (req.readyState == 4) {
            if(req.status == 200) {
                intData = JSON.parse(req.responseText)["data"];

                for (i in intData) {
                    var iconImage = new Image();

		    iconImage.crossOrigin = 'Benis';
                    iconImage.lon = intData[i][1];
                    iconImage.lat = intData[i][2];
                    iconImage.src = 'http://krautchan.net' + intData[i][3];
		    iconImage.count = intData[i][4];

                    iconImage.onload = function(e) {
			var factor = Math.ceil(Math.sqrt(this.count));
			if (factor > 4) {
			    factor = 4;
			};
			if (factor > 1) {
			    var canvas = document.createElement('canvas');
			    canvas.setAttribute('width', this.naturalWidth);
			    canvas.setAttribute('height',this.naturalHeight);
			    var context = canvas.getContext('2d');
			    context.fillStyle = '#ff00ff';
			    context.fillRect(0, 0, canvas.width, canvas.height);
			    context.drawImage(this, 0, 0);
			    var scaledImage = hqx(canvas, factor);
			    key(scaledImage);
			    this.src = scaledImage.toDataURL('image/png');
			};
                        iconSize = new OpenLayers.Size(this.naturalWidth * factor, this.naturalHeight * factor);
                        var iconOffset = new OpenLayers.Pixel(-(iconSize.w/2), -iconSize.h);

                        var marker = new OpenLayers.Marker(
                            new OpenLayers.LonLat(this.lon, this.lat),
                            new OpenLayers.Icon(this.src, iconSize, iconOffset)
                        );

                        markersLayer.addMarker(marker);
                    }
                }

                map.addLayer(markersLayer);
                markersLayer.setVisibility(true);
            } else {
                alert('Could not reach Krautchan /int/ API.');
            }
        }
    };
    req.send(null);

}, false);
