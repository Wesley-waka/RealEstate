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
              <View>
                <TouchableOpacity onPress={handleRemoveFilters}>
                  <Image source={icons.chevronLeft} className='size-5' />
                </TouchableOpacity>
              </View>
              <Text className="text-lg font-rubik-bold text-black-300">
                Filters
              </Text>
              <TouchableHighlight>
                <Text className="text-base font-rubik-bold text-primary-300">
                  Reset
                </Text>
              </TouchableHighlight>
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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