export const prepareRequestMethod = `export function prepareRequest({
  currency,
  payerAddress,
  payeeAddress,
  amount,
  invoiceDetails,
}: {
  currency: Currency;
  payerAddress: string;
  payeeAddress: string;
  amount: string;
  invoiceDetails: IContentData;
}) {
  const isERC20 = currency.type === Types.RequestLogic.CURRENCY.ERC20;
  const currencyValue = isERC20 ? currency.address : "eth";

  return {
    requestInfo: {
      currency: {
        type: currency.type,
        value: currencyValue,
        network: currency.network,
      },
      expectedAmount: amount,
      payee: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payeeAddress,
      },
      payer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payerAddress,
      },
      timestamp: Utils.getCurrentTimestampInSecond(),
    },
    paymentNetwork: {
      id: isERC20
        ? Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT
        : Types.Extension.PAYMENT_NETWORK_ID.ETH_FEE_PROXY_CONTRACT,
      parameters: {
        paymentNetworkName: currency.network,
        paymentAddress: payeeAddress,
        feeAddress: "0x0000000000000000000000000000000000000000",
        feeAmount: "0",
        tokenAddress: currencyValue,
      },
    },
    contentData: {
      meta: {
        format: "rnf_invoice",
        version: "0.0.3",
      },
      creationDate: invoiceDetails.creationDate,
      invoiceNumber: invoiceDetails.invoiceNumber,
      note: invoiceDetails.note,
      invoiceItems: invoiceDetails.invoiceItems,
      paymentTerms: invoiceDetails.paymentTerms,
      sellerInfo: invoiceDetails.sellerInfo,
      buyerInfo: invoiceDetails.buyerInfo,
      miscellaneous: invoiceDetails.miscellaneous,
    },
    signer: {
      type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
      value: payerAddress,
    },
  };
}`;

export const createRequestMethod = `export async function createRequest({
  requestParams,
  walletProvider,
  inMemory = false,
}: {
  requestParams: Types.ICreateRequestParameters;
  walletProvider: any;
  inMemory : boolean;
}) {
  const web3SignatureProvider = new Web3SignatureProvider(walletProvider);

  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: "https://gnosis.gateway.request.network",
    },
    skipPersistence: inMemory,
    signatureProvider: web3SignatureProvider,
  });

  const request = await requestClient.createRequest(requestParams);

  if(!inMemory){
    await request.waitForConfirmation();
  }
  
  return request;
}
`;

export const payRequestMethod = `export async function payRequest({
  requestId,
  inMemoryRequest,
  signer,
  provider,
  confirmationBlocks = 2,
}: {
  requestId?: string;
  inMemoryRequest?: any;
  signer: any;
  provider: any;
  confirmationBlocks: number;
}) {
  let requestData;

  if (inMemoryRequest) {
    requestData = inMemoryRequest.inMemoryInfo?.requestData;
    if (!requestData) {
      throw new Error("Invalid in-memory request");
    }
  } else if (requestId) {
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://gnosis.gateway.request.network",
      },
    });

    const request = await requestClient.fromRequestId(requestId);
    requestData = request.getData();
  } else {
    throw new Error("Either requestId or inMemoryRequest must be provided");
  }

  const isERC20 =
    requestData.currencyInfo.type === Types.RequestLogic.CURRENCY.ERC20;
  const payerAddress = requestData.payer?.value;

  if (isERC20) {
    const _hasSufficientFunds = await hasSufficientFunds({
      request: requestData,
      address: payerAddress as string,
      providerOptions: {
        provider,
      },
    });

    if (!_hasSufficientFunds) {
      throw new Error("Insufficient funds");
    }

    const _hasApproval = await hasErc20Approval(
      requestData,
      payerAddress as string,
      provider
    );

    if (!_hasApproval) {
      const _approve = await approveErc20(requestData, signer);

      await _approve.wait(confirmationBlocks);
    }
  }

  const paymentTx = await processPayment(requestData, signer);

  await paymentTx.wait(confirmationBlocks);

  return paymentTx;
}
`;

export const persistInMemoryRequestMethod = `export async function persistInMemoryRequest(request: any) {
  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: "https://gnosis.gateway.request.network",
    },
  });

  if (!request.inMemoryInfo) {
    throw new Error(
      "This request is not in-memory and cannot be persisted. Only in-memory requests can be persisted."
    );
  }

  await requestClient.persistRequest(request);
}`;

export const getRequestByIDMethod = `export async function getRequestByID(requestId: string) {
  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: "https://gnosis.gateway.request.network",
    },
  });

  const request = await requestClient.fromRequestId(requestId);

  const requestData = request.getData();

  return requestData;
}
`;

export const getRequestsByWalletAddressMethod = `export async function getRequestsByWalletAddress(walletAddress: string) {
  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: "https://gnosis.gateway.request.network",
    },
  });

  const requests = await requestClient.fromIdentity({
    type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
    value: walletAddress,
  });

  const requestsData = [];

  for (const request of requests) {
    requestsData.push(request.getData());
  }

  return requestsData;
}
`;
