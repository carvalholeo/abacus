import React from 'react';
import { FlatList, Keyboard } from 'react-native';
import {
  Button,
  FormControl,
  HStack,
  IconButton,
  Input,
  Pressable,
  Spinner,
  Text,
  VStack,
} from 'native-base';
import * as Haptics from 'expo-haptics';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ToastAlert from '../UI/ToastAlert';

type ErrorStateType = {
  description: string,
  source_name: string,
  destination_name: string,
  amount: string,
  category_id: string,
  budget_id: string,
  global: string,
}

const INITIAL_ERROR = {
  description: '',
  amount: '',
  source_name: '',
  destination_name: '',
  category_id: '',
  budget_id: '',
  global: '',
} as ErrorStateType;

const Form = ({
  accounts = [],
  categories = [],
  budgets = [],
  loading,
  descriptions = [],
  getAutocompleteAccounts,
  getAutocompleteDescription,
  getAutocompleteCategories,
  getAutocompleteBudgets,
  loadingAutocomplete,
  submit,
  goToTransactions,
  payload,
}) => {
  const [formData, setData] = React.useState({
    description: payload.description,
    date: new Date(payload.date),
    source_name: payload.source_name,
    destination_name: payload.destination_name,
    amount: payload.amount ? parseFloat(payload.amount).toFixed(payload.currency_decimal_places) : '',
    category_id: payload.category_id,
    category_name: payload.category_name,
    budget_id: payload.budget_id,
    budget_name: payload.budget_name,
    type: payload.type,
  });
  const [errors, setErrors] = React.useState(INITIAL_ERROR);
  const [success, setSuccess] = React.useState(false);
  const [displayAutocomplete, setDisplayAutocomplete] = React.useState({
    budget: false, category: false, description: false, source: false, destination: false,
  });

  const resetErrors = () => setErrors(INITIAL_ERROR);
  const closeAllAutocomplete = () => setDisplayAutocomplete({
    budget: false, category: false, description: false, source: false, destination: false,
  });

  const validate = () => {
    if (formData.description === undefined) {
      setErrors({
        ...errors,
        description: 'Description is required.',
      });
      return false;
    }
    if (formData.description.length < 1) {
      setErrors({
        ...errors,
        description: 'Description is too short.',
      });
      return false;
    }
    if (formData.amount === undefined || parseFloat(formData.amount) <= 0) {
      setErrors({
        ...errors,
        amount: 'Amount is required.',
      });
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    Keyboard.dismiss();
    if (validate()) {
      try {
        resetErrors();
        await submit(formData);
        setSuccess(true);
      } catch (e) {
        setSuccess(false);
        if (e.response) {
          setErrors({
            ...INITIAL_ERROR,
            global: e.response.data.message,
          });
        }
      }
    }
  };

  const colorItemTypes = {
    withdrawal: 'red.600',
    deposit: 'green.700',
    transfer: 'blue.700',
    'opening balance': 'blue.700',
  };

  return (
    <VStack mx="3" my={3} pb={240}>
      <FormControl isRequired>
        <HStack justifyContent="center">
          <Button.Group isAttached borderRadius={15}>
            {['withdrawal', 'deposit', 'transfer'].map((type) => (
              <Button
                shadow={2}
                onPress={() => setData({
                  ...formData,
                  type,
                })}
                _text={{
                  fontFamily: 'Montserrat_Bold',
                  textTransform: 'capitalize',
                }}
                _disabled={{
                  opacity: 1,
                }}
                onTouchEnd={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                isDisabled={type === formData.type}
                backgroundColor={type !== formData.type ? 'gray.400' : colorItemTypes[formData.type]}
                key={type}
                borderWidth={1}
                borderColor="white"
              >
                {type}
              </Button>
            ))}
          </Button.Group>
        </HStack>
      </FormControl>
      <FormControl mt="1" isRequired isInvalid={errors.description !== ''}>
        <FormControl.Label>
          Description
        </FormControl.Label>
        <Input
          returnKeyType="done"
          placeholder="Description"
          value={formData.description}
          onChangeText={(value) => {
            setData({
              ...formData,
              description: value,
            });
            getAutocompleteDescription({ query: value });
          }}
          onFocus={() => {
            getAutocompleteDescription({ query: formData.description });
            setDisplayAutocomplete({
              ...displayAutocomplete,
              description: true,
            });
          }}
          onBlur={closeAllAutocomplete}
          InputRightElement={(
            <IconButton
              p={2}
              borderRadius={15}
              colorScheme="gray"
              _icon={{
                as: AntDesign,
                name: 'closecircle',
                size: 19,
                color: 'gray.400',
              }}
              onPress={() => setData({
                ...formData,
                description: '',
              })}
            />
          )}
        />
        {'description' in errors ? <FormControl.ErrorMessage>{errors.description}</FormControl.ErrorMessage> : <></>}

        {displayAutocomplete.description && loadingAutocomplete && <Spinner mt={2} />}
        {displayAutocomplete.description && !loadingAutocomplete && (
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={descriptions}
            renderItem={(a) => (
              <Pressable
                mx={2}
                onPress={() => {
                  setData({
                    ...formData,
                    description: a.item.name,
                  });
                  closeAllAutocomplete();
                }}
                _pressed={{
                  borderRadius: 15,
                  backgroundColor: 'gray.300',
                }}
              >
                <HStack
                  justifyContent="space-between"
                  key={a.index}
                  mx={2}
                  my={2}
                >
                  <Text underline>
                    {a.item.name || 'no name'}
                  </Text>
                </HStack>
              </Pressable>
            )}
          />
        )}
      </FormControl>
      <FormControl mt="1" isInvalid={errors.source_name !== ''}>
        <FormControl.Label>
          Source account
        </FormControl.Label>
        <Input
          returnKeyType="done"
          placeholder="Source account"
          value={formData.source_name}
          onChangeText={(value) => {
            setData({
              ...formData,
              source_name: value,
            });
            getAutocompleteAccounts({ query: value, isDestination: false });
          }}
          onFocus={() => {
            getAutocompleteAccounts({ query: formData.source_name, isDestination: false });
            setDisplayAutocomplete({
              ...displayAutocomplete,
              source: true,
            });
          }}
          onBlur={closeAllAutocomplete}
          InputRightElement={(
            <IconButton
              p={2}
              borderRadius={15}
              colorScheme="gray"
              _icon={{
                as: AntDesign,
                name: 'closecircle',
                size: 19,
                color: 'gray.400',
              }}
              onPress={() => setData({
                ...formData,
                source_name: '',
              })}
            />
          )}
        />

        {displayAutocomplete.source && loadingAutocomplete && <Spinner mt={2} />}
        {displayAutocomplete.source && !loadingAutocomplete && (
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={accounts}
            renderItem={(a) => (
              <Pressable
                mx={2}
                onPress={() => {
                  setData({
                    ...formData,
                    source_name: a.item.name,
                  });
                  closeAllAutocomplete();
                }}
                _pressed={{
                  borderRadius: 15,
                  backgroundColor: 'gray.300',
                }}
              >
                <HStack
                  justifyContent="space-between"
                  key={a.index}
                  mx={2}
                  my={2}
                >
                  <Text underline>
                    {a.item.name_with_balance || 'no name'}
                  </Text>
                </HStack>
              </Pressable>
            )}
          />
        )}
      </FormControl>
      <FormControl mt="1" isInvalid={errors.destination_name !== ''}>
        <FormControl.Label>
          Destination account
        </FormControl.Label>
        <Input
          returnKeyType="done"
          placeholder="Destination account"
          value={formData.destination_name}
          onChangeText={(value) => {
            setData({
              ...formData,
              destination_name: value,
            });
            getAutocompleteAccounts({ query: value, isDestination: true });
          }}
          onFocus={() => {
            getAutocompleteAccounts({ query: formData.destination_name, isDestination: true });
            setDisplayAutocomplete({
              ...displayAutocomplete,
              destination: true,
            });
          }}
          onBlur={closeAllAutocomplete}
          InputRightElement={(
            <IconButton
              p={2}
              borderRadius={15}
              colorScheme="gray"
              _icon={{
                as: AntDesign,
                name: 'closecircle',
                size: 19,
                color: 'gray.400',
              }}
              onPress={() => setData({
                ...formData,
                destination_name: '',
              })}
            />
          )}
        />

        {displayAutocomplete.destination && loadingAutocomplete && <Spinner mt={2} />}
        {displayAutocomplete.destination && !loadingAutocomplete && (
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={accounts}
            renderItem={(a) => (
              <Pressable
                mx={2}
                onPress={() => {
                  setData({
                    ...formData,
                    destination_name: a.item.name,
                  });
                  closeAllAutocomplete();
                }}
                _pressed={{
                  borderRadius: 15,
                  backgroundColor: 'gray.300',
                }}
              >
                <HStack
                  justifyContent="space-between"
                  key={a.index}
                  mx={2}
                  my={2}
                >
                  <Text underline>
                    {a.item.name_with_balance || 'no name'}
                  </Text>
                </HStack>
              </Pressable>
            )}
          />
        )}

      </FormControl>
      <FormControl mt="1" isRequired>
        <FormControl.Label>
          Date
        </FormControl.Label>
        <DateTimePicker
          mode="date"
          style={{ width: 130 }}
          value={formData.date}
          onChange={(event, value) => setData({
            ...formData,
            date: value,
          })}
        />
      </FormControl>
      <FormControl mt="1" isRequired isInvalid={errors.amount !== ''}>
        <FormControl.Label>
          Amount
        </FormControl.Label>
        <Input
          InputLeftElement={<Text px={3} color="white">*</Text>}
          returnKeyType="done"
          keyboardType="numbers-and-punctuation"
          placeholder="0.00"
          value={formData.amount}
          textAlign="center"
          fontStyle="gray"
          fontSize={25}
          onChangeText={(value) => setData({
            ...formData,
            amount: value,
          })}
          InputRightElement={(
            <IconButton
              p={2}
              borderRadius={15}
              colorScheme="gray"
              _icon={{
                as: AntDesign,
                name: 'closecircle',
                color: 'gray.400',
              }}
              onPress={() => setData({
                ...formData,
                amount: '',
              })}
            />
          )}
        />
        {'amount' in errors ? <FormControl.ErrorMessage>{errors.amount}</FormControl.ErrorMessage> : <></>}
      </FormControl>
      <FormControl mt="1" isInvalid={errors.category_id !== ''}>
        <FormControl.Label>
          Category
        </FormControl.Label>
        <Input
          returnKeyType="done"
          placeholder="Category"
          value={formData.category_name}
          onChangeText={(value) => {
            setData({
              ...formData,
              category_name: value,
            });
            getAutocompleteCategories({ query: value || '', isDestination: true });
          }}
          onFocus={() => {
            getAutocompleteCategories({ query: formData.category_name || '' });
            setDisplayAutocomplete({
              ...displayAutocomplete,
              category: true,
            });
          }}
          onBlur={closeAllAutocomplete}
          InputRightElement={(
            <IconButton
              p={2}
              borderRadius={15}
              colorScheme="gray"
              _icon={{
                as: AntDesign,
                name: 'closecircle',
                size: 19,
                color: 'gray.400',
              }}
              onPress={() => setData({
                ...formData,
                category_id: '',
                category_name: '',
              })}
            />
          )}
        />

        {displayAutocomplete.category && loadingAutocomplete && <Spinner mt={2} />}
        {displayAutocomplete.category && !loadingAutocomplete && (
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={categories}
            renderItem={(a) => (
              <Pressable
                mx={2}
                onPress={() => {
                  setData({
                    ...formData,
                    category_id: a.item.id,
                    category_name: a.item.name,
                  });
                  closeAllAutocomplete();
                }}
                _pressed={{
                  borderRadius: 15,
                  backgroundColor: 'gray.300',
                }}
              >
                <HStack
                  justifyContent="space-between"
                  key={a.index}
                  mx={2}
                  my={1}
                >
                  <Text>
                    {a.item.name || 'no category name'}
                  </Text>
                </HStack>
              </Pressable>
            )}
          />
        )}
      </FormControl>
      <FormControl mt="1" isInvalid={errors.budget_id !== ''}>
        <FormControl.Label>
          Budget
        </FormControl.Label>
        <Input
          returnKeyType="done"
          placeholder="Budget"
          value={formData.budget_name}
          onChangeText={(value) => {
            setData({
              ...formData,
              budget_name: value,
            });
            getAutocompleteBudgets({ query: value || '', isDestination: true });
          }}
          onFocus={() => {
            getAutocompleteBudgets({ query: formData.budget_name || '' });
            setDisplayAutocomplete({
              ...displayAutocomplete,
              budget: true,
            });
          }}
          onBlur={closeAllAutocomplete}
          InputRightElement={(
            <IconButton
              p={2}
              borderRadius={15}
              colorScheme="gray"
              _icon={{
                as: AntDesign,
                name: 'closecircle',
                size: 19,
                color: 'gray.400',
              }}
              onPress={() => setData({
                ...formData,
                budget_id: '',
                budget_name: '',
              })}
            />
          )}
        />

        {displayAutocomplete.budget && loadingAutocomplete && <Spinner mt={2} />}
        {displayAutocomplete.budget && !loadingAutocomplete && (
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={budgets}
          renderItem={(a) => (
            <Pressable
              mx={2}
              onPress={() => {
                setData({
                  ...formData,
                  budget_id: a.item.id,
                  budget_name: a.item.name,
                });
                closeAllAutocomplete();
              }}
              _pressed={{
                borderRadius: 15,
                backgroundColor: 'gray.300',
              }}
            >
              <HStack
                justifyContent="space-between"
                key={a.index}
                mx={2}
                my={1}
              >
                <Text>
                  {a.item.name || 'no budget name'}
                </Text>
              </HStack>
            </Pressable>
          )}
        />
        )}
      </FormControl>

      {success && !loading && <ToastAlert title="Success" status="success" variant="solid" onClose={() => setSuccess(false)} description="Transaction created. Click here to go to transactions list." onPress={goToTransactions} />}
      {errors.global !== '' && !loading && <ToastAlert title="Error" status="error" variant="solid" onClose={resetErrors} description={errors.global} />}

      <Button
        mt="3"
        variant="outline"
        borderRadius={15}
        colorScheme="gray"
        onPress={() => {
          setData({
            date: new Date(),
            source_name: '',
            destination_name: '',
            description: '',
            amount: '',
            type: 'deposit',
            budget_id: '',
            budget_name: '',
            category_id: '',
            category_name: '',
          });
          resetErrors();
        }}
      >
        Reset
      </Button>
      <Button
        mt="2"
        shadow={2}
        borderRadius={15}
        _pressed={{
          style: {
            transform: [{
              scale: 0.99,
            }],
          },
        }}
        _loading={{
          bg: 'primary.50',
          _text: {
            color: 'white',
          },
          alignItems: 'flex-start',
          opacity: 1,
        }}
        _spinner={{
          color: 'white',
          size: 10,
        }}
        colorScheme="primary"
        isLoading={loading}
        isLoadingText="Submitting..."
        onPress={() => {
          onSubmit();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        Submit
      </Button>
    </VStack>
  );
};

export default Form;