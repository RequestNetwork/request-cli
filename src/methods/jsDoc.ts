export const prepareRequestJSDoc = `
/**
 * Prepares a request object for creating a request.
 * 
 * @param {Object} params - The parameters for preparing the request.
 * @param {Currency} params.currency - The currency object for the payment.
 * @param {string} params.currency.type - The type of currency ('ERC20' or 'ETH').
 * @param {string} params.currency.address - The address of the ERC20 token (if applicable).
 * @param {string} params.currency.network - The network of the currency.
 * @param {string} params.payerAddress - The Ethereum address of the payer.
 * @param {string} params.payeeAddress - The Ethereum address of the payee.
 * @param {string} params.amount - The amount to be paid, needs to be in blockchain readable format.
 * @param {IContentData} params.invoiceDetails - The invoice details.
 * @param {string} params.invoiceDetails.creationDate - The creation date of the invoice.
 * @param {string} params.invoiceDetails.invoiceNumber - The invoice number.
 * @param {string} params.invoiceDetails.note - Any additional notes for the invoice.
 * @param {Array} params.invoiceDetails.invoiceItems - The list of items in the invoice.
 * @param {string} params.invoiceDetails.paymentTerms - The payment terms for the invoice.
 * @param {Object} params.invoiceDetails.sellerInfo - Information about the seller.
 * @param {Object} params.invoiceDetails.buyerInfo - Information about the buyer.
 * @param {Object} params.invoiceDetails.miscellaneous - Any miscellaneous information.
 * 
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - requestInfo: Information about the payment request.
 *   - paymentNetwork: Details about the payment network to be used.
 *   - contentData: Detailed invoice information.
 *   - signer: Information about the signer of the request.
 * 
 * @example
 * const requestData = await prepareRequest({
 *   currency: { type: 'ERC20', address: '0x...', network: 'mainnet' },
 *   payerAddress: '0x...',
 *   payeeAddress: '0x...',
 *   amount: '1000000000000000000',
 *   invoiceDetails: {
 *     creationDate: '2023-04-01',
 *     invoiceNumber: 'INV-001',
 *     // ... other invoice details
 *   }
 * });
 */
`;

export const createRequestJSDoc = `
/**
 * Creates a new request using the provided parameters and wallet provider.
 * 
 * @param {Object} params - The parameters for creating the request.
 * @param {Types.ICreateRequestParameters} params.requestParams - The request parameters.
 * @param {any} params.walletProvider - The wallet provider for signing the request.
 * @param {boolean} [params.inMemory=false] - Whether to create the request without persisting it on the blockchain (default: false).
 * 
 * @returns {Promise<Object>} A promise that resolves to the created request object.
 *   The request object includes methods like waitForConfirmation() if not created in-memory.
 * 
 * @example
 * // Create a persistent request
 * const request = await createRequest({
 *   requestParams: {
 *     // ... request parameters
 *   },
 *   walletProvider: web3Provider
 * });
 * 
 * @example
 * // Create an in-memory request
 * const inMemoryRequest = await createRequest({
 *   requestParams: {
 *     // ... request parameters
 *   },
 *   walletProvider: web3Provider,
 *   inMemory: true
 * });
 */
`;

export const payRequestJSDoc = `
/**
 * Pay the request for a given request ID or an in-memory request.
 * 
 * @param {Object} params - The parameters for processing the payment request.
 * @param {string} [params.requestId] - The ID of the request to process (required if inMemoryRequest is not provided).
 * @param {any} [params.inMemoryRequest] - The in-memory request object (required if requestId is not provided).
 * @param {any} params.signer - The signer object for transaction signing.
 * @param {any} params.provider - The provider object for blockchain interaction.
 * @param {number} [params.confirmationBlocks=2] - The number of blocks to wait for confirmation.
 * 
 * @returns {Promise<Object>} A promise that resolves to the payment transaction object.
 * 
 * @throws {Error} Throws an error if there are insufficient funds for ERC20 payments or if neither requestId nor inMemoryRequest is provided.
 * 
 * @example
 * // Pay a request using requestId
 * const paymentTx = await payRequest({
 *   requestId: '0x1234...', // The request ID
 *   signer: web3Signer,
 *   provider: web3Provider,
 *   confirmationBlocks: 3
 * });
 * 
 * @example
 * // Pay an in-memory request
 * const paymentTx = await payRequest({
 *   inMemoryRequest: inMemoryRequestObject,
 *   signer: web3Signer,
 *   provider: web3Provider,
 *   confirmationBlocks: 3
 * });
 * 
 * // The payment transaction has been processed and confirmed
 * console.log('Payment transaction:', paymentTx);
 */
`;
export const persistInMemoryRequestJSDoc = `
/**
 * Persists an in-memory request to the Request Network.
 * 
 * @param {any} request - The in-memory request object to be persisted.
 * @throws {Error} If the request is not an in-memory request.
 * @returns {Promise<void>} A promise that resolves when the request is successfully persisted.
 */
`;

export const getRequestByIDJSDoc = `
/**
 * Retrieves a request by its ID from the Request Network.
 * 
 * @param {string} requestId - The ID of the request to retrieve.
 * 
 * @returns {Promise<Object>} A promise that resolves to the request data object.
 * 
 * @example
 * const requestData = await getRequestByID('0x1234...');
 * console.log('Request data:', requestData);
 */
`;

export const getRequestsByWalletAdderessJSDoc = `
/**
 * Retrieves all requests associated with a given wallet address.
 * 
 * @param {string} walletAddress - The Ethereum address of the wallet to query.
 * 
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of request data objects.
 * 
 * @example
 * const requests = await getRequestsByWalletAdderess('0x5678...');
 * console.log('Number of requests:', requests.length);
 * requests.forEach(request => console.log('Request:', request));
 */
`;
