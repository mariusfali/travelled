import { View, Text, SectionList, ListRenderItem, StyleSheet } from 'react-native'
import React from 'react'
import countriesData from "../../assets/data/countries-merged.json";

type Country = {
  properties: {
    ADMIN: string;
    ISO_A2: string;
  };
};

type CountryGroup = {
  title: string;
  data: Country[];
};

type ContinentSection = {
  title: string;
  data: CountryGroup[];
};

  const groupedCountries = countriesData.features.reduce(
    (groups, country) => {
      const continent = country.properties.REGION_UN ?? 'Other';

      if (!groups[continent]) {
        groups[continent] = [];
      }

      groups[continent].push(country);

      return groups;
    },
    {} as Record<string, Country[]>
  );

  const sections = Object.entries(groupedCountries).map(
    ([continent, countries]) => ({
      title: continent,
      data: countries,
    })
  );

const profile = () => {

  const renderItem: ListRenderItem<Country> = ({ item }) => (
    <View style={styles.country}>
      <Text style={styles.countryName}>{ item.properties.ADMIN }</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.properties.ISO_A2 ?? `country-${index}`}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
      />
    </View>
  )
}

export default profile


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 24,
    marginBottom: 20,
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  country: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  countryName: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 150,
  },
});