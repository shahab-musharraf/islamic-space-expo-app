import React from 'react'
import { Text, View } from 'react-native'

const MasjidInfo = ({masjid} : {masjid:any}) => {
  return (
    <View>
      <View>
        <Text>Address:</Text>
        <Text>{masjid.address}</Text>
      </View>
      
    </View>
  )
}

export default MasjidInfo