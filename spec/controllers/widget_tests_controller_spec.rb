require 'rails_helper'

describe '/widget_tests', type: :request do
  before do
    create(:channel_widget)
  end

  describe 'GET /widget_tests' do
    it 'renders the page correctly' do
      get widget_tests_url
      expect(response).to be_successful
    end

    it 'loads the compiled SDK for production-like widget testing' do
      allow(Rails.env).to receive(:development?).and_return(true)

      get widget_tests_url

      expect(response.body).to include('g.src= BASE_URL + "/packs/js/sdk.js";')
      expect(response.body).not_to include('/vite-dev/entrypoints/sdk.js')
      expect(response.body).not_to include('g.type = "module";')
    end

    it 'keeps the packaged SDK outside development' do
      get widget_tests_url

      expect(response.body).to include('g.src= BASE_URL + "/packs/js/sdk.js";')
      expect(response.body).not_to include('g.type = "module";')
    end
  end
end
