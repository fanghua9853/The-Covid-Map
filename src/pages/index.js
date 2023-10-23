import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import L from "leaflet";
import { useMap } from "react-leaflet";

import axios from 'axios';          // part 1
import { useTracker } from 'hooks';    // part 2
import { commafy, friendlyDate } from 'lib/util';    // part 2

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";
import Snippet from "components/Snippet";
import './App.css';
import { Card, Button, CardGroup, CardBody, CardSubtitle, CardTitle, CardText, CardImg } from 'reactstrap';


const LOCATION = {
  lat: 34.0522,
  lng: -118.2437,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;



const IndexPage = () => {
  const { data: countries = [] } = useTracker({
    api: 'countries'
  });
  const hasCountries = Array.isArray(countries) && countries.length > 0;

  console.log('@WILL -- warning: countries is null');
  if (countries) { 
    console.log('@WILL -- countries.length is: ', countries.length); 
  }

  const { data: stats = {} } = useTracker({ api: 'all' });
  
  const dashboardStats = [
    { primary:   { label: 'Total Cases',   value: commafy(stats?.cases) },
      secondary: { label: 'Per 1 Million', value: commafy(stats?.casesPerOneMillion) }
    },
    { primary:   { label: 'Total Deaths',  value: commafy(stats?.deaths) },
      secondary: { label: 'Per 1 Million', value: commafy(stats?.deathsPerOneMillion) }
    },
    { primary:   { label: 'Total Tests',   value: commafy(stats?.tests) },
      secondary: { label: 'Per 1 Million', value: commafy(stats?.testsPerOneMillion) }
    }
  ];

  async function mapEffect(map) { 
    // if (!hasCountries) { 
    //   console.log('@WILL: returning -- hasCountries is false');
    //   return; 
    // }    // part 2

    let response;            // part 1
    console.log('MapEffect automatically called, calling axios.get()');

    try { 
      response = await axios.get('https://corona.lmao.ninja/v2/countries');
    } catch(e) { 
      console.log('Failed to fetch countries: ${e.message}', e);
      return;
    }

    // const { countries = [] } = response;  // part 2
    // console.log(countries);
    const { data = [] } = response;   // part 1
    console.log(data);

    // const hasData = Array.isArray(countries) && countries.length > 0;  // part 2
    // if ( !hasData ) return;

    const hasData = Array.isArray(data) && data.length > 0;  // part 1
    if ( !hasData ) return;
    
    const geoJson = {
      type: 'FeatureCollection',
      // features: countries.map((country = {}) => {    // part 2
      features: data.map((country = {}) => {      // part 1
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [ lng, lat ]
          }
        }
      })
    }

    const geoJsonLayers = new L.GeoJSON(geoJson, {

      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let casesString;
    
        const {
          country,
          updated,
          cases,
          deaths,
          recovered
        } = properties
    
        casesString = `${cases}`;
    
        if ( cases > 1000 ) {
          casesString = `${casesString.slice(0, -3)}k+`
        }
    
        if ( updated ) {
          updatedFormatted = new Date(updated).toLocaleString();
        }
    
        const html = `
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" />
</head>

          <span class="icon-marker">
            <span class="icon-marker-tooltip">
              <h2>${country}</h2>
              <ul>
                <li><strong>Confirmed:</strong> ${cases}</li>
                <li><strong>Deaths:</strong> ${deaths}</li>
                <li><strong>Recovered:</strong> ${recovered}</li>
                <li><strong>Last Update:</strong> ${updatedFormatted}</li>
              </ul>
            </span>
            ${ casesString }
          </span>
          <script
          src="https://unpkg.com/react-bootstrap@next/dist/react-bootstrap.min.js"
          crossorigin></script>
          <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossorigin="anonymous"
        />
        `;
      
        return L.marker( latlng, {
          icon: L.divIcon({
            className: 'icon',
            html
          }),
          riseOnHover: true
        });
      }
    });
    console.log('@WILL -- about to complete geoJson');
    console.log(geoJson);

    geoJsonLayers.addTo(map);
  };

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "OpenStreetMap",
    zoom: DEFAULT_ZOOM,
    whenCreated: mapEffect,
  };



  return (
    
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

<body>
    <div className="tracker">


      <Map {...mapSettings} />
      <div className="tracker-stats">
        <ul>
          { dashboardStats.map(({ primary = {}, secondary = {} }, i ) => {
            return (
              <li key={`Stat-${i}`} className="tracker-stat text-red">
                 
              { primary.value && (
                <p className="tracker-stat-primary">
                  { primary.value }
                  <strong> { primary.label } </strong>
                </p>
              ) }
              { secondary.value && (
                <p className="tracker-stat-secondary">
                  { secondary.value } 
                  <strong> { secondary.label } </strong>
                </p>
              ) }
            </li>   
          );  
        }) }
      </ul>        
    </div>             
  </div> 
  <div className="tracker-last-updated">
    <p>Last Updated: { stats ? friendlyDate( stats?.updated ) : '-' } </p>
  </div>
  </body>

  <Container type="content" className="text-center home-start"> 

    <CardGroup>
    <div class="container">
    <div class="row">
   
    <div class="col-sm">
    <Card color="dark" id="rcorners1">
    <CardImg
      alt="Card image cap"
      src="https://www.coe.int/documents/21202288/62129062/languages-COVID-19_used+by+CoE+main+portal.jpg/b9882ed7-9e7b-caf8-c6e4-9cec0f125baa?t=1585837178000"
      top
      width="100%"
    />
    <CardBody>
      <CardTitle tag="h5" class="text-red">
        Testing Per Continent 
      </CardTitle>
      <CardSubtitle
        className="mb-2 text-muted"
        tag="h6" 
      >
        View stats for testing
      </CardSubtitle>
      <CardText>
        <a class="text-red" ></a>
      </CardText>
      

<div id="container" class="link">
  <Button>
        View
      </Button>
      <span class="tip">
      <iframe id="serviceFrameSend" src="https://dazzling-hypatia-b2d573.netlify.app/" height="400" width="500" title="description"></iframe>
      </span>
      </div>
    </CardBody>
  </Card>
  </div>
 
  <div class="col-sm">
  <Card color="dark" id="rcorners1">
    <CardImg
      alt="Card image cap"
      src="https://healthblog.uofmhealth.org/sites/consumer/files/2021-08/three-grey-syringes-orange-background.jpg"
      top
      width="100%"
    />
    <CardBody>
      <CardTitle tag="h5" class="text-red">
        Vaccines
      </CardTitle>
      <CardSubtitle
        className="mb-2 text-muted"
        tag="h6"
      >
        See Vaccine statistics
      </CardSubtitle>
      <CardText class="text-light">
      <a class="text-red" ></a>
      </CardText>
      <div id="container" class="link">
  <Button>
        View
      </Button>
      <span class="tip">
      <iframe id="serviceFrameSend" src="https://eloquent-payne-df6fb3.netlify.app" height="400" width="500" title="Iframe Example"></iframe>
      </span>
      </div>
    </CardBody>
  </Card>
  </div>

  <div class="col-sm">
  <Card color="dark" id="rcorners1">
    <CardImg
      alt="Card image cap"
      src="https://www.securitymagazine.com/ext/resources/images/ransomware-cyber.jpg?1627391855"
      top
      width="100%"
     
    />
    <CardBody>
      <CardTitle tag="h5" class="text-red">
        US Stats
      </CardTitle>
      <CardSubtitle
        className="mb-2 text-muted"
        tag="h6" 
      >
        View US infection data
      </CardSubtitle>
      <CardText  class="text-light">
      <a class="text-red" ></a>
      </CardText>
  
      <div id="container" class="link">
  <Button>
        View
      </Button>
      <span class="tip">
      <iframe id="us-data" src="https://public.domo.com/cards/axpDJ" width="100%" height="600" marginheight="0" marginwidth="0" frameborder="0"></iframe>      </span>
      </div>
    </CardBody>
  </Card>
 
  </div>
  </div>
  </div>
  </CardGroup>



  <CardGroup>
    <div class="container">
    <div class="row">
   
    <div class="col-sm">
    <Card color="dark" id="rcorners1">
    <CardImg
      alt="Card image cap"
      src="https://img.securityinfowatch.com/files/base/cygnus/siw/image/2021/09/bigstock_Cyber_Crime_Abstract_Concept__278825773.6132659179687.png?auto=format&w=1050&h=590&fit=clip"
      top
      width="100%"
    />
    <CardBody>
      <CardTitle tag="h5" class="text-red">
        Deaths
      </CardTitle>
      <CardSubtitle
        className="mb-2 text-muted"
        tag="h6"
      >
        View COVID-19 deaths
      </CardSubtitle>
      <CardText>
        <a class="text-red" ></a>
      </CardText>
      

<div id="container" class="link">
  <Button>
        View
      </Button>
      <span class="tip">
      <iframe id="serviceFrameSend" src="https://clever-sinoussi-cd959c.netlify.app/"  height="400" width="500" title="Iframe Example"></iframe>
      </span>
      </div>
    </CardBody>
  </Card>
  </div>
 
  <div class="col-sm">
  <Card color="dark" id="rcorners1">
    <CardImg
      alt="Card image cap"
      src="https://content.govdelivery.com/attachments/fancy_images/USNIST/2021/06/4670433/3618401/ss-health-medical-symbol-processor-74443075_crop.jpg"
      top
      width="100%"
    />
    <CardBody>
      <CardTitle tag="h5">
        Recovered
      </CardTitle>
      <CardSubtitle
        className="mb-2 text-muted"
        tag="h6"
      >
        Recovery stats post-infection
      </CardSubtitle>
      <CardText class="text-light">
      <a class="text-red" ></a>
      </CardText>
      <div id="container" class="link">
  <Button>
        View
      </Button>
      <span class="tip">
      <iframe id="serviceFrameSend" src="https://elegant-bhabha-00b081.netlify.app" height="400" width="500" title="Iframe Example"></iframe>
      </span>
      </div>
    </CardBody>
  </Card>
  </div>

  <div class="col-sm">
  <Card color="dark" id="rcorners1">
    <CardImg
      alt="Card image cap"
      src="https://files.techmahindra.com/static/img/cyber-scurity.jpg"
      top
      width="100%"
     
    />
    <CardBody>
      <CardTitle tag="h5" class="text-red">
        Global Infection
      </CardTitle>
      <CardSubtitle
        className="mb-2 text-muted"
        tag="h6"
      >
        View world stats
      </CardSubtitle>
      <CardText class="text-light">
      <a class="text-red" ></a>
      </CardText>
      
      <div id="container" class="link">
      
      <Button>
        View
      </Button>
      <span class="tip">
      <iframe id="globe-stat" src="https://ourworldindata.org/grapher/total-cases-covid-19?tab=map" width="100%" height="600px"></iframe>
      </span>
      </div>
    </CardBody>
  </Card>

  </div>


  </div>
  </div>
  
  </CardGroup>

  <iframe id="bottom-stack" src="https://adoring-curran-21390f.netlify.app" ></iframe>
    </Container>
  </Layout>
  
  );
};

export default IndexPage;
