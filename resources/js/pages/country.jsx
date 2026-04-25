import react from "react"
import { CountryTable } from "@/components/country/table"

export default function Countries(){
    return (
        <>
          <div className="space-y-5">
           
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <CountryTable />
                
            </div>
        </div>
        </>
    )
}