# Setup Self Hosted

## Prerequisites

- S3. Should be accessible on the internet. We use signed-url.
- Docker installed in your server

### Setup S3

You can use any Amazon S3 compatible API, such as Cloudflare R2. If you want to host S3 your self you can use minio or seaweeedfs, make sure the service is accessible for download/upload on the internet, we use signed-url for user to download directly on S3 service.

If you already have running S3 service, make sure there is a bucket "distapp" and create access key and secret key, which we'll use later.

If you want to deploy minio yourself, run this sample. Update the key accordingly.

```bash
curl -FsSL https://distapp.lhf.my.id/docker/docker-compose-minio.yml | docker compose -f /dev/stdin up -d
```

The default key is:
```bash
Access Key: minioadmin
Secret Key: 043ec277661d48bebab2972fd6043ebf
```

Make sure the service is accessible on the internet, you also have to make sure SSL is setup, it is up to you how you setup this whether you are using load balancer or access directly

### Setup DistApp

Run script below and follow the guide to setup S3

curl -FfSL https://distapp.lhf.my.id/install.sh | bash
