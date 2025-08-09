import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Server, Code, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/guides/add-endpoint')({
  component: AddEndpointGuide,
})

function AddEndpointGuide() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Server className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Creating API Endpoints</h1>
            <p className="text-muted-foreground">End-to-end REST API endpoint creation with Clean Architecture</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Guides</Badge>
          <Badge variant="outline">Advanced</Badge>
          <span className="text-sm text-muted-foreground">• 20 min read</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domain">Domain Layer</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="api">API Layer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clean Architecture Endpoint Creation</CardTitle>
              <CardDescription>
                Follow Clean Architecture principles to create robust, testable API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">8-Step Process</h4>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>1. <strong>Define Domain Entity</strong> - Core business object with behavior</li>
                  <li>2. <strong>Create Repository Interface</strong> - Data access contract in Domain</li>
                  <li>3. <strong>Implement Repository</strong> - EF Core implementation in Infrastructure</li>
                  <li>4. <strong>Create DTOs</strong> - Request/Response objects in Application</li>
                  <li>5. <strong>Define Service Interface</strong> - Business operation contract</li>
                  <li>6. <strong>Implement Service</strong> - Business logic orchestration</li>
                  <li>7. <strong>Create Controller</strong> - HTTP endpoint in API layer</li>
                  <li>8. <strong>Add Tests</strong> - Unit and integration tests</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example: Orders API</CardTitle>
              <CardDescription>Complete CRUD operations for order management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Endpoints to Create</h4>
                  <ul className="text-sm space-y-1">
                    <li>• POST /api/orders - Create order</li>
                    <li>• GET /api/orders - List with pagination</li>
                    <li>• GET /api/orders/&#123;id&#125; - Get by ID</li>
                    <li>• PUT /api/orders/&#123;id&#125; - Update order</li>
                    <li>• DELETE /api/orders/&#123;id&#125; - Cancel order</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Key Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Authentication required</li>
                    <li>• Input validation</li>
                    <li>• Error handling</li>
                    <li>• Pagination support</li>
                    <li>• Domain events</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Domain Entity</CardTitle>
              <CardDescription>Create the core business entity with encapsulated behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Order.cs</h4>
                <pre className="text-sm"><code>{`public class Order : Entity<Guid>
{
    public string OrderNumber &#123; get; private set; &#125;
    public Guid CustomerId &#123; get; private set; &#125;
    public decimal TotalAmount &#123; get; private set; &#125;
    public OrderStatus Status &#123; get; private set; &#125;
    public DateTime CreatedAt &#123; get; private set; &#125;

    private Order() &#123;&#125; // EF Constructor

    public Order(Guid customerId, decimal totalAmount)
    &#123;
        Id = Guid.NewGuid();
        CustomerId = customerId;
        TotalAmount = totalAmount;
        Status = OrderStatus.Pending;
        CreatedAt = DateTime.UtcNow;
        OrderNumber = GenerateOrderNumber();
        
        RaiseDomainEvent(new OrderCreatedEvent(Id, CustomerId));
    &#125;

    public void UpdateStatus(OrderStatus newStatus)
    &#123;
        if (Status == OrderStatus.Cancelled)
            throw new DomainException("Cannot update cancelled order");
            
        Status = newStatus;
        RaiseDomainEvent(new OrderStatusUpdatedEvent(Id, Status));
    &#125;
&#125;`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Services</CardTitle>
              <CardDescription>Business logic orchestration and DTOs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">DTOs</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`public record CreateOrderRequest(
    Guid CustomerId,
    decimal TotalAmount
);

public record OrderResponse(
    Guid Id,
    string OrderNumber,
    Guid CustomerId,
    decimal TotalAmount,
    OrderStatus Status,
    DateTime CreatedAt
);

public record OrderListResponse(
    IReadOnlyList<OrderResponse> Orders,
    int TotalCount,
    int PageNumber,
    int PageSize
);`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Controller</CardTitle>
              <CardDescription>HTTP endpoints with proper status codes and validation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">OrdersController.cs</h4>
                <pre className="text-sm"><code>{`[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : BaseController
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    &#123;
        _orderService = orderService;
    &#125;

    [HttpPost]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OrderResponse>> CreateOrder(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    &#123;
        var result = await _orderService.CreateOrderAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetOrder), new &#123; id = result.Id &#125;, result);
    &#125;

    [HttpGet("&#123;id&#125;")]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponse>> GetOrder(
        Guid id, 
        CancellationToken cancellationToken)
    &#123;
        var order = await _orderService.GetOrderByIdAsync(id, cancellationToken);
        return Ok(order);
    &#125;
&#125;`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}