# OrdersApi

All URIs are relative to *http://localhost:5000/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**ordersGet**](#ordersget) | **GET** /orders | Get my orders|
|[**ordersPost**](#orderspost) | **POST** /orders | Create a new order|

# **ordersGet**
> ordersGet()


### Example

```typescript
import {
    OrdersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

const { status, data } = await apiInstance.ordersGet();
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
|**200** | List of user orders |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ordersPost**
> ordersPost(ordersPostRequest)


### Example

```typescript
import {
    OrdersApi,
    Configuration,
    OrdersPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let ordersPostRequest: OrdersPostRequest; //

const { status, data } = await apiInstance.ordersPost(
    ordersPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ordersPostRequest** | **OrdersPostRequest**|  | |


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
|**201** | Order created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

