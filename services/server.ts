import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Element } from "@/components/ChartView";

interface GetData {
    data: { type: string, data: Element[] }[]
  }
  
  export const serverApi = createApi({
    reducerPath: 'serverApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://10.158.66.62:3000/sensor-data/' }),
    endpoints: (builder) => ({
      getDataByNodeId: builder.query<GetData, string>({
        query: (nodeId) => `node?nodeId=${nodeId}`,
      }),
    }),
  })
  
  export const { useGetDataByNodeIdQuery } = serverApi;