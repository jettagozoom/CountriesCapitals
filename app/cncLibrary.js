angular.module('cncLibrary', [])

.constant('GEONAMES_API_PREFIX', 'http://api.geonames.org')

.factory('cncCountries', ['$http', '$q', 'GEONAMES_API_PREFIX',
                  function($http,   $q,   GEONAMES_API_PREFIX) {
    var countryInfo = [];
    return function() {
        var defer = $q.defer(),
            path = "/countryInfoJSON?username=jettagozoom";

        if (countryInfo.length == 0) {
            $http.get(GEONAMES_API_PREFIX + path)
            .success(function(data) {
                countryInfo = removeDups(data.geonames);
                defer.resolve(countryInfo);
            })
        } else {
            defer.resolve(countryInfo);
        }

        return defer.promise;
    }

    // This is used to remove duplicate counties. There were a number of them.
    function removeDups(countries) {
        var newName,
            tmpArray = [],
            arrayLen,
            foundDup = false;

        for (var country in countries) {
            newName = countries[country].countryName;
            arrayLen = tmpArray.length;

            if (arrayLen == 0) {
                tmpArray.push(countries[country]);
            } else {
                foundDup = false;
                for (var i = 0; i < arrayLen; i++) {
                    var name = tmpArray[i].countryName;
                    if (name === newName) {
                        foundDup = true;
                        //console.log("Found a duplicate name: " + newname);
                        break;
                    }
                }
                if (foundDup == false) {
                    tmpArray.push(countries[country]);
                }
            }
        }
        return tmpArray;
    }
}])

.factory('cncCountry', ['cncCountries', '$q',
                function(cncCountries,   $q) {
    return function(countryCode) {
        var defer = $q.defer();
        cncCountries().then(function(countries) {
            for (var index in countries) {
                if (countryCode === countries[index].countryCode) {
                    defer.resolve(countries[index]);
                }
            }
        })
        return defer.promise;
    }
}])

.factory('cncCapital', ['$http', '$q', 'GEONAMES_API_PREFIX',
                function($http,   $q,   GEONAMES_API_PREFIX) {
    return function(country) {
        var defer = $q.defer(),
            path = "";

        if (country.capital == "") {
            defer.resolve(undefined);
        } else {
            path = "/searchJSON?" +
                   "q=" + country.capital +
                   "&featureCode=PPLC" +
                   "&country=" + country.countryCode + 
                   "&maxRows=2" +
                   "&username=jettagozoom";

            $http.get(GEONAMES_API_PREFIX + path)
            .success(function(data) {
                defer.resolve(data.geonames[0]);
            })
        }

        return defer.promise;
    }
}])

.factory('cncCountryNeighbors', ['$http', '$q', 'GEONAMES_API_PREFIX',
                         function($http,   $q,   GEONAMES_API_PREFIX) {
    return function(geonameId) {
        var defer = $q.defer(),
            path = "/neighboursJSON" +
                   "?geonameId=" + geonameId +
                   "&username=jettagozoom";

        $http.get(GEONAMES_API_PREFIX + path)
        .success(function(data) {
            defer.resolve(data.geonames);
        })

        return defer.promise;
    }
}])

.factory('cncTimezone', ['$http', '$q', 'GEONAMES_API_PREFIX',
                 function($http,   $q,   GEONAMES_API_PREFIX) {
    return function(capital) {
        var defer = $q.defer(),
            path = "";

        if (capital == undefined) {
            defer.resolve(undefined);
        } else {
            path = "/timezoneJSON" +
                   "?lat=" + capital.lat +
                   "&lng=" + capital.lng +
                   "&username=jettagozoom";

            $http.get(GEONAMES_API_PREFIX + path)
            .success(function(data) {
                defer.resolve(data);
            })
        }

        return defer.promise;
    }
}]);
