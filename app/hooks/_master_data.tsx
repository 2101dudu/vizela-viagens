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
      const res = await fetch("http://192.168.1.120:8080/api/get/master-data");
      const json = await res.json();
      let countries: Country[] = json.SearchProductMasterDataArray.CountriesArray.item;
      let locations: Location[] = json.SearchProductMasterDataArray.LocationsArray.item;

      // Sort by Portuguese name (description field)
      countries.sort((a, b) => {
        const nameA = a.Description || "";
        const nameB = b.Description || "";
        return nameA.localeCompare(nameB, "pt", { sensitivity: "base" });
      });

      locations.sort((a, b) => {
        const nameA = a.Description || "";
        const nameB = b.Description || "";
        return nameA.localeCompare(nameB, "pt", { sensitivity: "base" });
      });

      setData({ countries, locations });
    };

    fetchData();
  }, []);


  return data;
}
