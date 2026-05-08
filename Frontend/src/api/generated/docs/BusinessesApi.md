# BusinessesApi

All URIs are relative to *http://localhost:5000/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**businessesGet**](#businessesget) | **GET** /businesses | Get all businesses|
|[**businessesPost**](#businessespost) | **POST** /businesses | Create a new business|

# **businessesGet**
> businessesGet()


### Example

```typescript
import {
    BusinessesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BusinessesApi(configuration);

const { status, data } = await apiInstance.businessesGet();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | List of businesses |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **businessesPost**
> businessesPost(businessesPostRequest)


### Example

```typescript
import {
    BusinessesApi,
    Configuration,
    BusinessesPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new BusinessesApi(configuration);

let businessesPostRequest: BusinessesPostRequest; //

const { status, data } = await apiInstance.businessesPost(
    businessesPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **businessesPostRequest** | **BusinessesPostRequest**|  | |


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
|**201** | Business created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

