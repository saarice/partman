# API Specification

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Partnership Management Platform API
  version: 1.0.0
  description: Configuration-first partnership management and revenue tracking API

servers:
  - url: http://localhost:8000/api/v1
    description: Local development server

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Configuration:
      type: object
      required: [organizationId, category, key, value, dataType]
      properties:
        id:
          type: string
          format: uuid
        organizationId:
          type: string
          format: uuid
        category:
          type: string
          enum: [organization, team, revenue, commission, pipeline, integration]
        key:
          type: string
        value:
          oneOf:
            - type: string
            - type: number
            - type: boolean
            - type: object
            - type: array
        defaultValue:
          oneOf:
            - type: string
            - type: number
            - type: boolean
            - type: object
            - type: array
        dataType:
          type: string
          enum: [string, number, boolean, object, array]
        isRequired:
          type: boolean
        validationRules:
          type: object

    Partner:
      type: object
      required: [organizationId, name, domain, commissionStructure]
      properties:
        id:
          type: string
          format: uuid
        organizationId:
          type: string
          format: uuid
        name:
          type: string
        domain:
          type: string
        commissionStructure:
          type: object
          properties:
            type:
              type: string
              enum: [referral, reseller, msp, custom]
            percentage:
              type: number
              minimum: 0
              maximum: 100
            paymentModel:
              type: string
              enum: [one-time, recurring, hybrid]

    Opportunity:
      type: object
      required: [organizationId, partnerId, customerName, dealValue, stage]
      properties:
        id:
          type: string
          format: uuid
        organizationId:
          type: string
          format: uuid
        partnerId:
          type: string
          format: uuid
        customerName:
          type: string
        dealValue:
          type: number
          minimum: 0
        stage:
          type: string
        probability:
          type: number
          minimum: 0
          maximum: 100

paths:
  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                organizationSubdomain:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
                  organization:
                    $ref: '#/components/schemas/Organization'

  /configurations:
    get:
      tags: [Configuration]
      summary: Get organization configurations
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [organization, team, revenue, commission, pipeline]
      responses:
        '200':
          description: Configuration list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Configuration'

    post:
      tags: [Configuration]
      summary: Create or update configuration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Configuration'
      responses:
        '201':
          description: Configuration created/updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Configuration'

  /partners:
    get:
      tags: [Partners]
      summary: Get organization partners
      parameters:
        - name: domain
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [active, inactive, pending]
      responses:
        '200':
          description: Partner list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Partner'

    post:
      tags: [Partners]
      summary: Create new partner
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Partner'
      responses:
        '201':
          description: Partner created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Partner'

  /partners/{id}:
    get:
      tags: [Partners]
      summary: Get partner by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Partner details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Partner'

    put:
      tags: [Partners]
      summary: Update partner
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Partner'
      responses:
        '200':
          description: Partner updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Partner'

  /opportunities:
    get:
      tags: [Opportunities]
      summary: Get opportunities with filtering
      parameters:
        - name: stage
          in: query
          schema:
            type: string
        - name: partnerId
          in: query
          schema:
            type: string
            format: uuid
        - name: assignedUserId
          in: query
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Opportunity list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Opportunity'

    post:
      tags: [Opportunities]
      summary: Create new opportunity
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Opportunity'
      responses:
        '201':
          description: Opportunity created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Opportunity'

  /dashboard/kpis:
    get:
      tags: [Dashboard]
      summary: Get executive KPI dashboard data
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [current_quarter, last_quarter, ytd]
            default: current_quarter
      responses:
        '200':
          description: KPI dashboard data
          content:
            application/json:
              schema:
                type: object
                properties:
                  revenueProgress:
                    type: object
                    properties:
                      current:
                        type: number
                      target:
                        type: number
                      percentage:
                        type: number
                  pipelineHealth:
                    type: object
                    properties:
                      totalValue:
                        type: number
                      stageDistribution:
                        type: object
                      conversionRates:
                        type: object
                  teamPerformance:
                    type: array
                    items:
                      type: object
                      properties:
                        userId:
                          type: string
                        name:
                          type: string
                        revenue:
                          type: number
                        opportunities:
                          type: number
```
