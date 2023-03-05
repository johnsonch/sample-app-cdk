require 'json'
require 'aws-sdk'

def main
  client = Aws::ECS::Client.new(region: ENV['AWS_REGION'])

  clusters = client.list_clusters
  clusters.cluster_arns.each do |cluster|
    client.list_services(cluster: cluster).service_arns.each do |service|
      puts "Restarting #{service} on #{cluster}"
      client.update_service(
        service: service,
        force_new_deployment: true,
        cluster: cluster
      )
    end
  end
end

def lambda_handler(event:, context:)
  doppler = "doppler: #{event['headers']['x-doppler-signature']}"
  cluster = "cluster: #{event['queryStringParameters']['cluster']}"
  # main
  { statusCode: 200, body: JSON.generate("Success: #{doppler} / #{cluster}") }
end
