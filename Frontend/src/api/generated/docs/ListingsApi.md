# ListingsApi

All URIs are relative to *http://localhost:5000/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**listingsGet**](#listingsget) | **GET** /listings | Get all listings|
|[**listingsPost**](#listingspost) | **POST** /listings | Create a new listing|

# **listingsGet**
> listingsGet()


### Example

```typescript
import {
    ListingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ListingsApi(configuration);

let category: string; //Filter by category (optional) (default to undefined)

const { status, data } = await apiInstance.listingsGet(
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | [**string**] | Filter by category | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of listings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listingsPost**
> listingsPost(listingsPostRequest)


### Example

```typescript
import {
    ListingsApi,
    Configuration,
    ListingsPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ListingsApi(configuration);

let listingsPostRequest: ListingsPostRequest; //

const { status, data } = await apiInstance.listingsPost(
    listingsPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **listingsPostRequest** | **ListingsPostRequest**|  | |


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
|**201** | Listing created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

