"use client";

import { useEffect, useState } from "react";

export interface Country {
  Code: string;
  Description: string;
  Continent: string;
}

export interface Location {
  Code: string;
  Description: string;
  Country: string;
}

interface MasterData {
  countries: Country[];
  locations: Location[];
}

export function useMasterData() {
  const [data, setData] = useState<MasterData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8080/api/get/master-data");
      const json = await res.json();
      const countries = json.SearchProductMasterDataArray.CountriesArray.item;
      const locations = json.SearchProductMasterDataArray.LocationsArray.item;
      setData({ countries, locations });
    };

    fetchData();
  }, []);

  return data;
}
