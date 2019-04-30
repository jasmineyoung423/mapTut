var locationsRef = firebase.database().ref('locationData/');
var locationDataArray = [];

locationsRef.on('value', function(snapshot)
{
    shapshotToArray(snapshot);
    updateLocations();
})

function shapshotToArray(snapshot)
{
    var locationArray = [];
    snapshot.forEach(function(childSnapshot)
    {
        var item = childSnapshot.val();
        locationArray.push(item);

    })
    locationDataArray = locationArray;
}

