# UsersApi

All URIs are relative to *http://localhost:5000/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**usersLoginPost**](#usersloginpost) | **POST** /users/login | Login a user|
|[**usersRegisterPost**](#usersregisterpost) | **POST** /users/register | Register a new user|

# **usersLoginPost**
> usersLoginPost(usersLoginPostRequest)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UsersLoginPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let usersLoginPostRequest: UsersLoginPostRequest; //

const { status, data } = await apiInstance.usersLoginPost(
    usersLoginPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **usersLoginPostRequest** | **UsersLoginPostRequest**|  | |


### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Login successful |  -  |
|**401** | Invalid credentials |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersRegisterPost**
> usersRegisterPost(usersRegisterPostRequest)


### Example

```typescript
import {
    UsersApi,
    Configuration,
    UsersRegisterPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let usersRegisterPostRequest: UsersRegisterPostRequest; //

const { status, data } = await apiInstance.usersRegisterPost(
    usersRegisterPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **usersRegisterPostRequest** | **UsersRegisterPostRequest**|  | |


### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | User registered successfully |  -  |
|**400** | Invalid input |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

