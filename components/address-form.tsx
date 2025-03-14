"use client"

import { Input } from "@/components/ui/input"

interface AddressFormProps {
  address: string
  city: string
  state: string
  zipCode: string
  onChange: (field: string, value: string) => void
}

export function AddressForm({ address, city, state, zipCode, onChange }: AddressFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Address
        </label>
        <Input
          id="address"
          value={address}
          onChange={(e) => onChange("address", e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium mb-1">
          City
        </label>
        <Input
          id="city"
          value={city}
          onChange={(e) => onChange("city", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            State
          </label>
          <Input
            id="state"
            value={state}
            onChange={(e) => onChange("state", e.target.value)}
            required
            placeholder="Enter state"
          />
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
            Zip Code
          </label>
          <Input
            id="zipCode"
            value={zipCode}
            onChange={(e) => onChange("zipCode", e.target.value)}
            required
            placeholder="Enter zip code"
          />
        </div>
      </div>
    </div>
  )
} 