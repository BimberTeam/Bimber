ARG GO_VERSION=1.11

FROM golang:${GO_VERSION}-alpine AS builder

RUN apk add --no-cache  git tzdata
WORKDIR /src

COPY ./go.mod  ./
RUN go mod download


COPY . .

# Build the executable to `/app`. Mark the build as statically linked.
RUN CGO_ENABLED=0 go build -installsuffix 'static' -o /image_server .

FROM scratch AS final

COPY --from=builder /image_server /image_server
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
ENV TZ=GMT

EXPOSE 8080

ENTRYPOINT ["/image_server"]