/* global describe, it */

import expect from 'expect.js';
import {
    renameProperty,
    renamePropertyValue,
    renamePropertyType,
} from '../../lib/report/util.js';

describe(`renamePropertyValue`, () => {
  it(`returns same value when no propertyName given`, () => {
    expect(renamePropertyValue(`NO`)).to.equal(`NO`);
    expect(renamePropertyValue(`mr`)).to.equal(`mr`);
  });

  it(`expands country code when $country_code is the propertyName`, () => {
    expect(renamePropertyValue(`GB`, `$mp_country_code`)).to.equal(`United Kingdom`);
    expect(renamePropertyValue(`us`, `$country_code`)).to.equal(`United States`);
  });  

  it(`expands event when $event is the propertyName`, () => {
    expect(renamePropertyValue(`$top_events`, `$event`)).to.equal(`Your Top Events`);
    expect(renamePropertyValue(`$signup`, `$event`)).to.equal(`Signup`);
  });    

  it(`expands $all_people when $people is the propertyName`, () => {
    expect(renamePropertyValue(`$all_people`, `$people`)).to.equal(`All People`);
  });      
});

describe(`renameProperty`, () => {
  it(`expands pre-defined properties`, () => {
    expect(renameProperty(`$city`)).to.equal(`City`);
    expect(renameProperty(`$browser`)).to.equal(`Browser`);
  }); 

  it(`transforms unknown $properties`, () => {
    expect(renameProperty(`$signal_strength`)).to.equal(`Signal Strength`);    
  });

  it(`passes through user defined properties`, () => {
    expect(renameProperty(`Alien code`)).to.equal(`Alien code`);    
  });          
});


describe(`renamePropertyType`, () => {
  it(`expands pre-defined types`, () => {
    expect(renamePropertyType(`number`)).to.equal(`Integer`);
    expect(renamePropertyType(`boolean`)).to.equal(`True/False`);
  });

  it(`capitalizes user defined properties`, () => {
    expect(renamePropertyType(`template`)).to.equal(`Template`);
    expect(renamePropertyType(`id`)).to.equal(`Id`);
  });    
});
