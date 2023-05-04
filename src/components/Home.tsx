import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  View,
} from 'react-native';
import {
  HStack,
  Text,
  VStack,
  ScrollView,
  Box,
  Skeleton,
} from 'native-base';
import Animated, { Layout } from 'react-native-reanimated';

import { useDispatch, useSelector } from 'react-redux';
import colors from '../constants/colors';
import RangeTitle from './UI/RangeTitle';
import { translate } from '../i18n/locale';
import { localNumberFormat } from '../lib/common';
import { RootDispatch, RootState } from '../store';
import TabControl from './TabControl';

const InsightCategories = () => {
  const {
    categories: {
      getInsightCategories,
    },
  } = useDispatch<RootDispatch>();
  const insightCategories = useSelector((state: RootState) => state.categories.insightCategories);
  const { loading } = useSelector((state: RootState) => state.loading.effects.categories.getInsightCategories);

  return (
    <ScrollView
      refreshControl={(
        <RefreshControl
          refreshing={false}
          onRefresh={getInsightCategories}
          tintColor={colors.brandStyle}
        />
      )}
    >
      <Box borderTopWidth={0} borderBottomWidth={1} borderColor="gray.200">
        {insightCategories.map((category, index) => (
          <HStack
            key={category.name}
            mx={3}
            py={2}
            minH={45}
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth={index + 1 === insightCategories.length ? 0 : 1}
            borderColor="gray.200"
          >
            <Text style={{ fontFamily: 'Montserrat' }}>
              {category.name}
            </Text>

            {!loading ? (
              <Text style={{
                fontFamily: 'Montserrat_Bold',
                color: category.difference_float < 0 ? colors.brandDanger : colors.brandStyle3,
              }}
              >
                {localNumberFormat(category.currency_code, category.difference_float)}
              </Text>
            ) : (
              <Skeleton w={70} h={5} rounded={15} />
            )}
          </HStack>
        ))}
      </Box>
      <View style={{ height: 370 }} />
    </ScrollView>
  );
};

const AssetsAccounts = () => {
  const {
    accounts: {
      getAccounts,
    },
  } = useDispatch<RootDispatch>();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const { loading } = useSelector((state: RootState) => state.loading.effects.accounts.getAccounts);

  return (
    <ScrollView
      refreshControl={(
        <RefreshControl
          refreshing={false}
          onRefresh={getAccounts}
          tintColor={colors.brandStyle}
        />
      )}
    >
      <Box borderTopWidth={0} borderBottomWidth={1} borderColor="gray.200">
        {accounts && accounts?.filter((a) => a.attributes.active).map((account, index) => (
          <HStack
            key={account.attributes.name}
            mx={3}
            py={2}
            minH={45}
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth={index + 1 === accounts?.filter((a) => a.attributes.active).length ? 0 : 1}
            borderColor="gray.200"
          >
            <Text style={{ fontFamily: 'Montserrat' }}>
              {account.attributes.name}
              {' '}
              <Text style={{
                fontSize: 10,
                fontFamily: 'Montserrat',
                color: colors.brandDanger,
              }}
              >
                {account.attributes.include_net_worth ? '' : '(*)'}
              </Text>
            </Text>

            {!loading ? (
              <Text style={{
                fontFamily: 'Montserrat_Bold',
                color: parseFloat(account.attributes.current_balance) < 0 ? colors.brandDanger : colors.brandStyle3,
              }}
              >
                {localNumberFormat(account.attributes.currency_code, account.attributes.current_balance)}
              </Text>
            ) : (
              <Skeleton w={70} h={5} rounded={15} />
            )}
          </HStack>
        ))}
      </Box>
      <View style={{ height: 370 }} />
    </ScrollView>
  );
};

const Home = ({
  netWorth,
  balance,
  loading,
}) => {
  const [tab, setTab] = useState('home_accounts');

  return (useMemo(() => (
    <>
      <RangeTitle />
      <Animated.View layout={Layout}>
        {netWorth && netWorth[0] && (
        <VStack pt={4} alignItems="center">

          {!loading ? (
            <Text style={{
              fontSize: 27,
              lineHeight: 30,
              fontFamily: 'Montserrat_Bold',
            }}
            >
              {localNumberFormat(netWorth[0].currency_code, netWorth[0].monetary_value)}
            </Text>
          ) : (
            <Skeleton w={170} h={8} rounded={15} />
          )}
          <Text style={{
            fontSize: 13,
            fontFamily: 'Montserrat_Light',
            color: 'gray',
          }}
          >
            {`${translate('home_net_worth')} (${netWorth[0].currency_code})`}
          </Text>
        </VStack>
        )}

        {balance && balance[0] && (
        <VStack p={1} pb={2} justifyContent="center" alignItems="center">
          {!loading ? (
            <Box style={{
              backgroundColor: balance[0].monetary_value < 0 ? colors.brandDangerLight : colors.brandSuccessLight,
              borderColor: balance[0].monetary_value < 0 ? colors.brandDangerLight : colors.brandSuccessLight,
              borderRadius: 15,
              borderRightWidth: 6,
              borderLeftWidth: 6,
            }}
            >
              <Text style={{
                fontSize: 13,
                fontFamily: 'Montserrat_Bold',
                textAlign: 'center',
                color: balance[0].monetary_value < 0 ? colors.brandDanger : colors.brandStyle3,
              }}
              >
                {`${balance[0].monetary_value > 0 ? '+' : ''}${localNumberFormat(balance[0].currency_code, balance[0].monetary_value)}`}
              </Text>
            </Box>
          ) : (
            <Skeleton w={50} h={4} rounded={15} />
          )}
        </VStack>
        )}

        <TabControl
          values={['home_accounts', 'home_categories']}
          onChange={setTab}
        />

        {tab === 'home_accounts' && <AssetsAccounts />}
        {tab === 'home_categories' && <InsightCategories />}
        <View style={{ height: 240 }} />
      </Animated.View>
    </>
  ), [
    loading,
    netWorth,
    balance,
    tab,
  ]));
};

export default Home;
