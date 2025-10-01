// Test script để kiểm tra API endpoints
// Chạy: node test-api.js

const BASE_URL = "http://localhost:3000";

async function testAPI() {
  console.log("🧪 Testing GLVIETSUB API...\n");

  try {
    // Test 1: GET /api/movies với pagination
    console.log("1. Testing GET /api/movies?page=1&limit=2");
    const moviesResponse = await fetch(`${BASE_URL}/api/movies?page=1&limit=2`);
    const moviesData = await moviesResponse.json();

    if (moviesResponse.ok) {
      console.log("✅ Success!");
      console.log(`   Page: ${moviesData.page}`);
      console.log(`   Limit: ${moviesData.limit}`);
      console.log(`   Total: ${moviesData.total}`);
      console.log(`   Data count: ${moviesData.data.length}`);
      console.log(`   First movie: ${moviesData.data[0]?.title || "N/A"}\n`);
    } else {
      console.log("❌ Failed:", moviesData.error);
    }

    // Test 2: GET /api/movies/[id]
    if (moviesData.data && moviesData.data.length > 0) {
      const movieId = moviesData.data[0].id;
      console.log(`2. Testing GET /api/movies/${movieId}`);

      const movieResponse = await fetch(`${BASE_URL}/api/movies/${movieId}`);
      const movieData = await movieResponse.json();

      if (movieResponse.ok) {
        console.log("✅ Success!");
        console.log(`   Movie: ${movieData.title}`);
        console.log(`   Country: ${movieData.country}`);
        console.log(`   Category: ${movieData.category}`);
        console.log(`   Status: ${movieData.status}\n`);
      } else {
        console.log("❌ Failed:", movieData.error);
      }
    }

    // Test 3: Test với ID không tồn tại
    console.log("3. Testing GET /api/movies/999 (non-existent ID)");
    const notFoundResponse = await fetch(`${BASE_URL}/api/movies/999`);
    const notFoundData = await notFoundResponse.json();

    if (notFoundResponse.status === 404) {
      console.log("✅ Success! (404 as expected)");
      console.log(`   Error: ${notFoundData.error}\n`);
    } else {
      console.log("❌ Unexpected response:", notFoundData);
    }

    // Test 4: Test pagination parameters
    console.log("4. Testing invalid pagination parameters");
    const invalidResponse = await fetch(
      `${BASE_URL}/api/movies?page=0&limit=0`
    );
    const invalidData = await invalidResponse.json();

    if (invalidResponse.status === 400) {
      console.log("✅ Success! (400 as expected)");
      console.log(`   Error: ${invalidData.error}\n`);
    } else {
      console.log("❌ Unexpected response:", invalidData);
    }

    console.log("🎉 API testing completed!");
  } catch (error) {
    console.error("❌ Test failed - Status: failed");
    console.log("\n💡 Make sure the development server is running:");
    console.log("   npm run dev");
  }
}

// Chạy test
testAPI();
