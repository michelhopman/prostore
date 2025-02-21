import { generateAccessToken, paypal } from "../lib/paypal";

//Test to generate access token
test("generate access token from paypal", async () => {
  const tokenresponse = await generateAccessToken();
  console.log(tokenresponse);
  expect(typeof tokenresponse).toBe("string");
  expect(tokenresponse).not.toBeNull();
});

//Test to create order
test("create order from paypal", async () => {
  // const tokenresponse = await generateAccessToken();
  const price = 10.0;
  const orderresponse = await paypal.createOrder(price);
  expect(orderresponse).toHaveProperty("id");
  expect(orderresponse).toHaveProperty("status");
  expect(orderresponse.status).toBe("CREATED");
});

//test to capture payment with mockorder
test("simulate capture payment from paypal", async () => {
  const orderId = 100;
  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({ status: "COMPLETED" });
  const captureResponse = await paypal.capturePayment(orderId.toString());
  expect(captureResponse).toHaveProperty("status", "COMPLETED");
  mockCapturePayment.mockRestore();
});
