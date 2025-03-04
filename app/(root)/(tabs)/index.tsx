import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  StyleSheet, TouchableHighlight
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import { Card, FeaturedCard } from "@/components/Cards";
import { useAppwrite } from "@/lib/useAppwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { getLatestProperties, getProperties } from "@/lib/appwrite";
import seed from "@/lib/seed";
import Rheostat, {BarRheostat, RheostatThemeProvider} from "react-native-rheostat";
import Divider from "@/components/Divider";

interface HandleState{
  values: number[];
}
const Home = () => {
  const { user } = useGlobalContext();
  const [modalVisible, setModalVisible] = useState(false);
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  const { data: latestProperties, loading: latestPropertiesLoading } =
      useAppwrite({
        fn: getLatestProperties,
      });

  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    });
  }, [params.filter, params.query]);

  const demoTwoValues = [20,50]
  const demoSnaps = [0,20,30,40,50,60,70,80,100];

  const filterBar = {
    snapPoints: [0,60,120,180,240,300,330,360,420,480,540,570,600,630,660,690,
      720,750,780,810,840,870,900,930,960,990,1020,1050,1080,1110,1140,1170,1200,
      1260,1320,1380,
      1440],
    values: [
      480, 1040
    ],
    svgData: [ 50, 50, 10, 10, 40, 40, 95,95, 85, 85, 91, 35, 53, 53, 24, 50,
      50, 10, 40, 95, 85, 91, 35, 53,  24, 50,
      50, 10, 40, 95, 85, 91, 35, 53,  50, 50,
      50, 10, 40, 95, 91, 91, 24, 24,  50, 50,
      10, 10,  ]
  };

  const [timeRange,setTimeRange] = useState<number[]>([10, 80]);



  const onRheostatValUpdated = (state: HandleState): void => {
    setTimeRange(state.values);
  };

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const handleDisplayFilters =(): void =>{
    setModalVisible(true);
  }

  const handleRemoveFilters = (): void => {
    setModalVisible(false);
  }
  return (
      <SafeAreaView className="h-full bg-white">
        <FlatList
            data={properties}
            numColumns={2}
            renderItem={({ item }) => (
                <Card item={item} onPress={() => handleCardPress(item.$id)} />
            )}
            keyExtractor={(item) => item.$id}
            contentContainerClassName="pb-32"
            columnWrapperClassName="flex gap-5 px-5"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                  <ActivityIndicator size="large" className="text-primary-300 mt-5" />
              ) : (
                  <NoResults />
              )
            }
            ListHeaderComponent={() => (
                <View className="px-5">
                  <View className="flex flex-row items-center justify-between mt-5">
                    <View className="flex flex-row">
                      <Image
                          source={{ uri: user?.avatar }}
                          className="size-12 rounded-full"
                      />
                      <View className="flex flex-col items-start ml-2 justify-center">
                        <Text className="text-xs font-rubik text-black-100">
                          Good Morning
                        </Text>
                        <Text className="text-base font-rubik-medium text-black-300">
                          {user?.name}
                        </Text>
                      </View>
                    </View>
                    <Image source={icons.bell} className="size-6" />
                  </View>
                  <Search handleDisplayFilters={handleDisplayFilters}/>
                  <View className="my-5">
                    <View className="flex flex-row items-center justify-between">
                      <Text className="text-xl font-rubik-bold text-black-300">
                        Featured
                      </Text>
                      <TouchableOpacity>
                        <Text className="text-base font-rubik-bold text-primary-300">
                          See all
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {latestPropertiesLoading ? (
                        <ActivityIndicator size="large" className="text-primary-300" />
                    ) : !latestProperties || latestProperties.length === 0 ? (
                        <NoResults />
                    ) : (
                        <FlatList
                            data={latestProperties}
                            renderItem={({ item }) => (
                                <FeaturedCard
                                    item={item}
                                    onPress={() => handleCardPress(item.$id)}
                                />
                            )}
                            keyExtractor={(item) => item.$id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerClassName="flex gap-5 mt-5"
                        />
                    )}
                  </View>
                  <View className="mt-5">
                    <View className="flex flex-row items-center justify-between">
                      <Text className="text-xl font-rubik-bold text-black-300">
                        Our Recommendation
                      </Text>
                      <TouchableOpacity>
                        <Text className="text-base font-rubik-bold text-primary-300">
                          See all
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Filters />
                  </View>
                </View>
            )}
        />
        <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
            hardwareAccelerated={true}
        >

          <View style={styles.centeredView}>
            <View style={styles.modalView} >
              <View className="flex flex-row items-center justify-between">
                <TouchableOpacity onPress={handleRemoveFilters}>
                  <Image source={icons.chevronLeft} className='size-5' />
                </TouchableOpacity>
              <Text className="text-lg font-rubik-bold text-black-300">
                Filters
              </Text>
              <TouchableHighlight>
                <Text className="text-base font-rubik-bold text-primary-300">
                  Reset
                </Text>
              </TouchableHighlight>
              </View>

              <View>
                <Text className="text-lg font-rubik-bold text-black-300">Price Range</Text>

                <BarRheostat values={filterBar.values} min={0} max={1440}
                             snap={true} snapPoints={filterBar.snapPoints}
                             svgData = {filterBar.svgData}
                             onValuesUpdated={onRheostatValUpdated}
                             theme={{ rheostat: { themeColor: '#0061FF', grey: '#fafafa' } }}
                />

                <Text className="text-lg font-rubik-bold text-black-300 mt-4">Property Type</Text>

                  <Filters />

              </View>

              <View className='mt-2'>
                <Text className="text-lg font-rubik-bold text-black-300">Home Details</Text>

                <View className="my-3 flex flex-row justify-between">
                  <Text className="text-xl text-black-200">Bedrooms</Text>

                  <View className='flex flex-row items-center justify-between gap-4'>
                    <View className='p-[10px] bg-blue-50 rounded-full'>
                      <Image source={icons.minus} className='size-4 ' />
                    </View>

                    <Text>3</Text>
                    <View className='p-[10px] bg-blue-50 rounded-full'>
                      <Image source={icons.add} className='size-3 ' />
                    </View>
                  </View>

                </View>

                <Divider/>

                <View className="my-3 flex flex-row justify-between">
                  <Text className="text-xl text-black-200">Bathroom</Text>

                  <View className='flex flex-row items-center justify-between gap-4'>
                    <View className='p-[10px] bg-blue-50 rounded-full'>
                      <Image source={icons.minus} className='size-4 ' />
                    </View>

                    <Text>3</Text>
                    <View className='p-[10px] bg-blue-50 rounded-full'>
                      <Image source={icons.add} className='size-3 ' />
                    </View>
                  </View>

                </View>


              </View>


              <View>
                <Text className="text-lg font-rubik-bold text-black-300">Building Size</Text>


                <Rheostat values={demoTwoValues} min={0} max={100}
                          snap snapPoints={demoSnaps}
                          theme={{ rheostat: { themeColor: '#0061FF', grey: '#fafafa' } }}
                />
              </View>

              <TouchableOpacity className="flex-end mt-10 flex-row items-center justify-center bg-primary-300 py-4 rounded-full shadow-md shadow-zinc-400">
                <Text className="text-white text-lg text-center font-rubik-bold">
                  Set Filter
                </Text>
              </TouchableOpacity>

            </View>
          </View>

        </Modal>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    // margin: 20,
    backgroundColor: 'white',
    borderBottomEndRadius: 30,
    borderRadius: 20,

    padding: 15,
    height: '70%',
    width: '100%', // Adjust width as needed
    // alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Home;