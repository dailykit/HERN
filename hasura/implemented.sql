CREATE SCHEMA _rrule;
CREATE SCHEMA aws;
CREATE SCHEMA brands;
CREATE SCHEMA "cartFunctions";
CREATE SCHEMA content;
CREATE SCHEMA crm;
CREATE SCHEMA datahub_schema;
CREATE SCHEMA developer;
CREATE SCHEMA "deviceHub";
CREATE SCHEMA editor;
CREATE SCHEMA experiences;
CREATE SCHEMA experts;
CREATE SCHEMA fulfilment;
CREATE SCHEMA imports;
CREATE SCHEMA ingredient;
CREATE SCHEMA insights;
CREATE SCHEMA instructions;
CREATE SCHEMA inventory;
CREATE SCHEMA master;
CREATE SCHEMA notifications;
CREATE SCHEMA "onDemand";
CREATE SCHEMA "order";
CREATE SCHEMA packaging;
CREATE SCHEMA "paymentHub";
CREATE SCHEMA platform;
CREATE SCHEMA products;
CREATE SCHEMA rules;
CREATE SCHEMA safety;
CREATE SCHEMA segmentation;
CREATE SCHEMA settings;
CREATE SCHEMA "simpleRecipe";
CREATE SCHEMA sqldemo;
CREATE SCHEMA subscription;
CREATE SCHEMA ux;
CREATE SCHEMA website;



CREATE TYPE public.summary AS (
   pending jsonb,
   underprocessing jsonb,
   readytodispatch jsonb,
   outfordelivery jsonb,
   delivered jsonb,
   rejectedcancelled jsonb
);