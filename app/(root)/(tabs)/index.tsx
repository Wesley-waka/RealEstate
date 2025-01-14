import { View, Text, Image, TouchableOpacity, FlatList, Button, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { Link, router, useLocalSearchParams } from 'expo-router'
import TabsLayout from './_layout'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images'
import icons from '@/constants/icons'
import Search from '@/components/Search'
import { Card, FeaturedCard } from '@/components/Cards'
import Filters from '@/components/Filters'
import { useGlobalContext } from '@/lib/global-provider';
import seed from '@/lib/seed';
import { useAppwrite } from '@/lib/useAppwrite'
import { getLatestProperties, getProperties } from '@/lib/appwrite'
import NoResults from '@/components/NoResults'

const index = () => {
  const { user } = useGlobalContext();
  const params = useLocalSearchParams<{ query?: string; filter?: string; }>();

  const { data: latestProperties, loading: latestPropertiesLoading, } = useAppwrite({
    fn: getLatestProperties,

  })

  const { data: properties, loading, refetch } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6
    },
    skip: true
  })

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 6
    })
  }, []);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`)

  return (
    <SafeAreaView className='bg-white h-full'>
      {/* <Button title="Seed" onPress={seed}></Button> */}
      <FlatList
        data={properties}
        renderItem={({ item }) =>
          <Card item={item} onPress={() => handleCardPress(item.$id)} />
        }

        ListEmptyComponent={
          loading ? (<ActivityIndicator size='large' className='text-primary-300 mt-5' />) : <NoResults />
        }
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerClassName='pb-32'
        columnWrapperClassName='flex gap-5 px-5'
        ListHeaderComponent={
          <View className='px-5'>
            <View className='flex flex-row items-center justify-between mt-5'>
              <View className='flex flex-row item-center'>
                <Image source={{ uri: user?.avatar }} className='size-12 rounded-full' />
                <View className='flex flex-col items-start ml-2 justify-center' />
                <Text className='text-xs font-rubik text-black-100'>Good Morning</Text>
                <Text className='text-base font-rubik-medium text-black-300'>Adrian</Text>
              </View>
              <Image source={icons.bell} className='size-6' />
            </View>
            <Search />
            <View className='my-5'>
              <View className='flex flex-row items-center justify-between'>
                <Text className='text-xl font-rubik-bold text-black-300'>Featured</Text>
                <TouchableOpacity>
                  <Text className='text-base font-rubik-bold text-primary-300'>See All</Text>
                </TouchableOpacity>
              </View>

              {latestPropertiesLoading ? (<ActivityIndicator size='large' className='text-primary-300' />) : !latestProperties || latestProperties.length === 0 ? <NoResults /> : <FlatList
                data={latestProperties} renderItem={({ item }) => <FeaturedCard item={item} onPress={() => handleCardPress(item.$id)} />} keyExtractor={(item) => item.toString()} horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName='flex gap-5 mt-5'
              ></FlatList>}


            </View>


            {/* <View className='flex flex-row gap-5 mt-5'>
              <FeaturedCard />
              <FeaturedCard />
              <FeaturedCard />
            </View> */}

            <View className='flex flex-row items-center justify-between'>
              <Text className='text-xl font-rubik-bold text-black-300'>Our Recommendation</Text>
              <TouchableOpacity>
                <Text className='text-base font-rubik-bold text-primary-300'>See All</Text>
              </TouchableOpacity>

              <Filters />

              {/* <View className='flex flex-row gap-5 mt-5'>
                <Card />
                <Card />
              </View> */}
            </View>
          </View>


        }
      >

      </FlatList>






    </SafeAreaView >
  )
}

export default index