export function PredictionMarketExplanation() {
  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-4 text-center">How This Prediction Market Works</h2>

      <div className="space-y-4 text-base-content">
        <p>This is an order-book based prediction market where trades gets settled only with a counterparty</p>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">What is a Prediction Market?</h3>
          <p>
            A prediction market allows participants to bet on the outcome on a future event. You can buy and sell the
            respective shares in which outcome you believe in. The market price reflects the collective probability
            assessment of the event occurring.
          </p>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              There are two ways to participate in the prediction market: Through positions, where you find a
              counterparty who takes the opposite side of your prediction. When matched, new tokens are created for both
              parties. The other option is through offers, where you can directly buy or sell existing tokens from other
              users.
            </li>
            <li>
              To create new trading tokens you can go to the positions overview tab and create a new position by
              selecting your expected outcome (Yes/No) and the amount you want to invest. This increases the overall
              token supply.
            </li>
            <li>
              If you have tokens you can sell them in the offer overview tab or also watch out for possible offers for
              tokens. This has no impact on the overall token supply, since tokens just changes hands.
            </li>
            <li>If you control the oracle address you can resolve the prediction market</li>
          </ol>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Key Features:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Token Creation and therefor provide liqudity into the market</li>
            <li>Order-book mechanism for trading tokens before resolution</li>
            <li>Simple orcale integration to resolve the prediction market</li>
          </ul>
        </div>
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Missing Features:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Real order-book functionality with sorting and caculate probability</li>
            <li>Reduce Supply of tokens via burning</li>
            <li>Real racle Integration</li>
            <li>Redeem winning token after resolution</li>
            <li>No fee/revenue accural for the prediction market</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
