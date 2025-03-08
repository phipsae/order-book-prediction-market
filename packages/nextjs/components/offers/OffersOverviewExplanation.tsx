export function OffersOverviewExplanation() {
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Trading Offers</h2>

      <div className="space-y-4 text-base-content">
        <p>If you have tokens or you want to buy some, the Offer Overview is the place to look.</p>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Available Options:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Take existing offers created by other users</li>
            <li>Create your own buy or sell offers</li>
            <li>Cancel your unfilled offers at any time</li>
          </ul>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Selling Tokens:</h3>
          <p>
            If you hold tokens, you can create a sell offer where you ask for ETH in exchange for your tokens. Buyers
            can purchase all or part of your offered tokens, and multiple users can take portions of the same offer.
          </p>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Buying Tokens:</h3>
          <p>
            If you want to buy tokens, you can create a buy offer where you provide ETH in exchange for tokens. This is
            especially useful when there are no available offers that meet your requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
