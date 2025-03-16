import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { DataElement } from "@/services/data";

interface GetData {
  nodeId: string;
  data: { type: string; data: DataElement[] }[];
}

export const serverApi = createApi({
  reducerPath: "serverApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.158.66.62:3000/sensor-data/",
  }),
  endpoints: (builder) => ({
    getDataByNodeId: builder.query<GetData, string>({
      query: (nodeId) => `node?nodeId=${nodeId}`,
    }),
  }),
});

export const { useGetDataByNodeIdQuery } = serverApi;
